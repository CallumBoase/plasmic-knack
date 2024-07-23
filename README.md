# Plasmic-Knack

Component (Knack Provider) for interacting with the Knack API from Plasmic.

The Knack Provider component uses view-based authentication and can be used to:
* Fetch records
* Create records
* Update records
* Delete records

Optimistic mutations are available (optional) so you can create seamless user experiences that are not normally available in a Knack app.

Components or pages you make can be published back to your Knack app using the instructions in [plasmic-codegen-into-html-with-vite](https://github.com/CallumBoase/plasmic-codegen-into-html-with-vite).

## How to create a custom-view for your Knack app
In this section we explain how to use Plasmic-Knack to create a custom view to embed into your Knack app.

1. Create a new Plasmic app in the Plasmic user interface.
2. Create a new code repo on your local machine and set it up as per [plasmic-codegen-into-html-with-vite](https://github.com/CallumBoase/plasmic-codegen-into-html-with-vite). See the [How To Use instructions](https://github.com/CallumBoase/plasmic-codegen-into-html-with-vite?tab=readme-ov-file#how-to-use) there.
    * Follow instructions in all sections except the section called "Registering custom components for use in Plasmic studio"
3.  In your repo, install `plasmic-knack` by running this command in terminal:
    ```bash
    npm install plasmic-knack
    ```
4. Register the `plasmic-knack` component so you can use it in Plasmic studio:
    1. Make sure you've already [configured your custom app host](https://github.com/CallumBoase/plasmic-codegen-into-html-with-vite?tab=readme-ov-file#configuring-your-plasmic-app-to-use-this-repo-as-its-custom-app-host)
    2. Go to `./src/plasmic-host.tsx` and add these lines:
        ```tsx
        //Add these imports near the top of your file
        import { KnackProvider, KnackProviderMeta } from "plasmic-knack"
        ```
        ```tsx
        //Register custom components below all imports
        registerComponent(KnackProvider, KnackProviderMeta);
        ```
    3. Make sure your dev server is running (`npm run dev`) and then Refresh Plasmic studio. You should see the new `KnackProvider` component ready to use under "Custom Components"
5. Create components that use `KnackProvider` in Plasmic studio then follow the [Development Workflow](https://github.com/CallumBoase/plasmic-codegen-into-html-with-vite?tab=readme-ov-file#development-workflow) to attach them to the browser window and test them.
6. [Deploy your repo to Netlify](https://github.com/CallumBoase/plasmic-codegen-into-html-with-vite?tab=readme-ov-file#configuring-netlify-deployment) 
7. Import your custom component into your Knack app and use as required (more info coming soon)
