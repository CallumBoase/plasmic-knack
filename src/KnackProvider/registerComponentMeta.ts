import { CodeComponentMeta } from "@plasmicapp/host";
import { KnackProviderProps } from ".";

//Component metadata for registration in Plasmic
export const KnackProviderMeta : CodeComponentMeta<KnackProviderProps> = {
  name: "KnackProvider",
  importPath: "./index",
  providesData: true,
  props: {
    queryName: {
      type: "string",
      required: true,
    },
    applicationId: {
      type: "string",
      required: true,
    },
    userToken: {
      type: "string",
      required: true,
    },
    getRecordsView: {
      type: "string",
      required: true,
    },
    getRecordsScene: {
      type: "string",
      required: true,
    },
    addRecordView: {
      type: "string",
      required: true,
    },
    addRecordScene: {
      type: "string",
      required: true,
    },
    editRecordView: {
      type: "string",
      required: true,
    },
    editRecordScene: {
      type: "string",
      required: true,
    },
    deleteRecordView: {
      type: "string",
      required: true,
    },
    deleteRecordScene: {
      type: "string",
      required: true,
    },
    onError: {
      type: "eventHandler",
      argTypes: [{name: 'knackProviderError', type: 'object'}],
      required: false,
    },
    simulateRandomMutationErrors: {
      type: "boolean",
      advanced: true
    },
    children: {
      type: "slot",
      defaultValue: [
        {
          type: "text",
          value: 'Knack provider. Need to add instructions here'
        },
      ],
    },
  },
  refActions: {
    addRecord: {
      description: "add a record",
      argTypes: [
        { name: "recordForKnack", type: "object", displayName: "Record object to send to Knack" },
        { name: "optimisticRecord", type: "object", displayName: "Optimistic new record object (optional)"},
      ],
    },
    editRecord: {
      description: "edit a record",
      argTypes: [
        { name: "recordForKnack", type: "object", displayName: "Record object to send to Knack" },
        { name: "optimisticRecord", type: "object", displayName: "Optimistic edited record object (optional)"},
      ]
    },
    deleteRecord: {
      description: "delete a record",
      argTypes: [
        { name: "recordId", type: "string", displayName: "Record ID to delete" },
      ]
    },
  },
}