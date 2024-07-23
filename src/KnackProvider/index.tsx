import React, { useState, forwardRef, useCallback, useImperativeHandle } from "react";
import { useMutablePlasmicQueryData } from "@plasmicapp/query";
import { DataProvider } from "@plasmicapp/host";
import { v4 as uuid } from "uuid";

//@ts-ignore
import KnackAPI from "knack-api-helper";

//Declare types
type Record = {
  id: string;
  [key: string]: any;
};

type RecordWithoutId = {
  [key: string]: any;
}

type Records = Record[] | null;

type DeleteResult = {
  deletedRecordId: string;
}

type KnackProviderError = {
  errorId: string;
  summary: string;
  errorObj: any;
  actionAttempted: string;
  recordId: string | null;
  recordForKnack: Record | RecordWithoutId | null;
  optimisticRecord: Record | RecordWithoutId | null;
}

interface Actions {
  addRecord(recordForKnack: any, optimisticRecord: any): Promise<Record | KnackProviderError>;
  editRecord(recordForKnack: any, optimisticRecord: any): Promise<Record | KnackProviderError>;
  deleteRecord(recordId: string): Promise<DeleteResult | KnackProviderError>;
}

export interface KnackProviderProps {
  children: React.ReactNode;
  applicationId: string;
  userToken: string;
  getRecordsView: string;
  getRecordsScene: string;
  addRecordView: string;
  addRecordScene: string;
  editRecordView: string;
  editRecordScene: string;
  deleteRecordView: string;
  deleteRecordScene: string;
  onError: (knackProviderError: KnackProviderError) => void;
  simulateRandomMutationErrors: boolean;
  queryName: string;
  className?: string;
}

//The component
export const KnackProvider = forwardRef<Actions, KnackProviderProps>(
  function KnackProvider(props, ref) {
    const {
      children,
      applicationId,
      userToken,
      getRecordsView,
      getRecordsScene,
      addRecordView,
      addRecordScene,
      editRecordView,
      editRecordScene,
      deleteRecordView,
      deleteRecordScene,
      onError,
      simulateRandomMutationErrors,
      queryName,
      className,
    } = props;

    // const [mutationError, setMutationError] = useState<string | null>(null);
    const [isMutating, setIsMutating] = useState<boolean>(false);
    const [getRecordsError, setGetRecordsError] = useState<KnackProviderError | null>(null);

    //Use the useMutablePlasmicQueryData hook to fetch the data
    //Works very similar to useSWR
    const {
      data,
      //The error object from useSWR contains errors from mutation and fetch
      //We don't use it because we customise behaviour below, to give separate fetch & mutation behavior
      //error,
      mutate,
      isLoading,
    } = useMutablePlasmicQueryData(queryName, async () => {

      setIsMutating(false);
      setGetRecordsError(null);

      try {

        const knackAPI = new KnackAPI({
          auth: "view-based",
          applicationId,
          userToken,
        });
  
        const res = await knackAPI.getMany({
          view: getRecordsView,
          scene: getRecordsScene,
        });
  
        const records = res.records;
  
        return records;

      } catch(err) {
        const knackProviderError = {
          errorId: uuid(),
          summary: 'Error fetching records',
          errorObj: err,
          actionAttempted: 'read',
          recordForKnack: null,
          optimisticRecord: null,
          recordId: null
        };
        setGetRecordsError(knackProviderError);
        onError(knackProviderError);
        throw(err);
      }

      
      
    }, {
      shouldRetryOnError: false
    });

    //Function that just returns the data unchanged
    //To pass in as an optimistic update function when no optimistic update is desired
    //Effectively disabling optimistic updates for the operation
    function returnUnchangedData(data: Records) {
      return data;
    }

    //Function to add a row to existing data optimistically
    const addRecordOptimistically = useCallback(
      (currentRecords: Records, optimisticRecord: RecordWithoutId | Record) => {
        console.log('addRecordOptimistically', currentRecords, optimisticRecord)
        const optimisticRecords = [...(currentRecords || []), optimisticRecord];
        return optimisticRecords;
      },
      []
    );

    //Function for optimistic edit of a row in existing data
    //Replaces the row by matching uniqueIdentifierField (id)
    const editRecordOptimistically = useCallback(
      (data: Records, optimisticRecord: Record) => {
        const newData =
          data?.map((existingRecord) => {
            if (optimisticRecord.id === existingRecord.id) {
              return optimisticRecord;
            }
            return existingRecord;
          }) || [];
        return newData;
      },
      []
    );

    //Function for optimistic delete of a row from existing data
    //Returns the data without the record with the matching recordId
    const deleteRecordOptimistically = useCallback(
      (data: Records, recordId: string) => {
        //Check that the provided record ID was a string
        if (typeof recordId !== "string") {
          throw new Error(
            `Unable to optimistically delete record. recordId must be a string but was ${typeof recordId}`
          );
        }
        //Filter out the record with the matching ID, returning the rest of the data
        const newData = data?.filter((record) => record.id !== recordId);
        return newData;
      },
      []
    );

    //Function to actually add record to Knack via an API call
    const addRecord = useCallback(
      async (recordForKnack: Record) : Promise<Records> => {

        if(simulateRandomMutationErrors && Math.random() > 0.5) {
          //1 second delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          throw new Error('Simulated error adding record');
        }

        //Add the record to Knack
        const knackAPI = new KnackAPI({
          auth: "view-based",
          applicationId,
          userToken,
        });

        const response = await knackAPI.post({
          scene: addRecordScene,
          view: addRecordView,
          body: recordForKnack,
        });

        const recordCreated = response.json.record;

        return recordCreated;
      },
      [applicationId, userToken, addRecordScene, addRecordView, simulateRandomMutationErrors]
    );

    //Function to actually update row in Knack via an API call
    const editRecord = useCallback(
      async (recordForKnack: Record) => {

        if(simulateRandomMutationErrors && Math.random() > 0.5) {
          //1 second delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          throw new Error('Simulated error editing record');
        }

        //Update the record in Knack
        const knackAPI = new KnackAPI({
          auth: "view-based",
          applicationId,
          userToken,
        });

        const response = await knackAPI.put({
          scene: editRecordScene,
          view: editRecordView,
          recordId: recordForKnack.id,
          body: recordForKnack,
        });

        const recordUpdated = response.json.record as Record;
        return recordUpdated;
      },
      [applicationId, userToken, editRecordScene, editRecordView, simulateRandomMutationErrors]
    );

    //Function to actually delete a row in Knack via an API call
    const deleteRecord = useCallback(
      async (recordId: string) => {

        if(simulateRandomMutationErrors && Math.random() > 0.5) {
          //1 second delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          throw new Error('Simulated error deleting record');
        }

        //Delete the record in Knack
        const knackAPI = new KnackAPI({
          auth: "view-based",
          applicationId,
          userToken,
        });

        await knackAPI.delete({
          scene: deleteRecordScene,
          view: deleteRecordView,
          recordId: recordId,
        });

        return { deletedRecordId: recordId };
      },
      [applicationId, userToken, deleteRecordScene, deleteRecordView, simulateRandomMutationErrors]
    );

    //Helper function to choose the correct optimistic data function to run
    function chooseOptimisticFunc(
      optimisticOperation: string | null | undefined,
      elementActionName: string
    ) {
      if (optimisticOperation === "addRecord") {
        return addRecordOptimistically;
      } else if (optimisticOperation === "editRecord") {
        return editRecordOptimistically;
      } else if (optimisticOperation === "deleteRow") {
        return deleteRecordOptimistically;
      } else {
        //None of the above, but something was specified
        if (optimisticOperation) {
          throw new Error(`
              Invalid optimistic operation specified in "${elementActionName}" element action.
              You specified  "${optimisticOperation}" but the allowed values are "addRow", "editRow", "deleteRow", "replaceData" or left blank for no optimistic operation.
          `);
        }

        //Nothing specified, function that does not change data (ie no optimistic operation)
        return returnUnchangedData;
      }
    }

    //Define element actions to run from Plasmic Studio
    useImperativeHandle(ref, () => ({
      //Element action to add a record with optional optimistic update & auto-refetch when done
      addRecord: async (recordForKnack, optimisticRecord) => {
        setIsMutating(true);

        //Choose the optimistic function based on whether the user has specified optimisticRow
        //No optimisticRow means the returnUnchangedData func will be used, disabling optimistic update
        let optimisticOperation = optimisticRecord ? "addRecord" : null;
        const optimisticFunc = chooseOptimisticFunc(
          optimisticOperation,
          "Add Record"
        );

        optimisticRecord = { ...optimisticRecord, optimisticId: uuid(), isOptimistic: true };

        //Run the mutation
        try {
          const result = await mutate(addRecord(recordForKnack), {
            optimisticData: (currentRecords: Records) => optimisticFunc(currentRecords, optimisticRecord),
            populateCache: false,
            revalidate: true,
            rollbackOnError: true
          });
          return result;

        } catch(err) {
          const knackProviderError = {
            errorId: uuid(),
            summary: 'Error adding record',
            errorObj: err,
            actionAttempted: 'create',
            recordForKnack: recordForKnack || null,
            optimisticRecord: optimisticRecord || null,
            recordId: null
          };
          onError(knackProviderError);
          return { error: knackProviderError };
        }
      },

      //Element action to edit a record with optional optimistic update & auto-refetch when done
      editRecord: async (recordForKnack, optimisticRecord) => {
        // setMutationError(null);
        setIsMutating(true);
        //Choose the optimistic function based on whether the user has specified optimisticRow
        //No optimisticRow means the returnUnchangedData func will be used, disabling optimistic update
        let optimisticOperation = optimisticRecord ? "editRecord" : null;
        const optimisticFunc = chooseOptimisticFunc(
          optimisticOperation,
          "Edit Record"
        );

        optimisticRecord = { ...optimisticRecord, isOptimistic: true };

        //Run the mutation
        try {
          const result = await mutate(editRecord(recordForKnack), {
            optimisticData: (currentRecords: Records) => optimisticFunc(currentRecords, optimisticRecord),
            populateCache: false,
            revalidate: true,
            rollbackOnError: true
          })
          return result;

        } catch(err) {
          const knackProviderError = {
            errorId: uuid(),
            summary: 'Error editing record',
            errorObj: err,
            actionAttempted: 'update',
            recordForKnack: recordForKnack || null,
            optimisticRecord: optimisticRecord || null,
            recordId: recordForKnack?.id
          };
          onError(knackProviderError);
          return { error: knackProviderError };
        }
        
      },

      //Element action to delete a record with optional optimistic update & auto-refetch when done
      deleteRecord: async (recordId) => {
        setIsMutating(true);
        // setMutationError(null);
        //Run the mutation
        //We always run optimistic delete, since there's no extra configuration needed by the user
        try {
          const result = await mutate(deleteRecord(recordId), {
            optimisticData: (currentRecords: Records) => deleteRecordOptimistically(currentRecords, recordId),
            populateCache: false,
            rollbackOnError: true,
            revalidate: true
          });
          return result;

        } catch(err) {
          const knackProviderError = {
            errorId: uuid(),
            summary: 'Error deleting record',
            errorObj: err,
            actionAttempted: 'delete',
            recordForKnack: null,
            optimisticRecord: null,
            recordId: recordId
          };
          onError(knackProviderError);
          return { error: knackProviderError };
        }
      },
    }));

    return (
      <div className={className}>
        <DataProvider
          name={queryName}
          data={{ data, isLoading, isMutating, getRecordsError }}
        >
          {children}
        </DataProvider>
      </div>
    );
  }
);
