# Plasmic-Knack

Component (Knack Provider) for interacting with the Knack API from Plasmic.

The Knack Provider component uses view-based authentication and can be used to:
* Fetch records
* Create records
* Update records
* Delete records

Optimistic mutations are available (optional) so you can create seamless user experiences that are not normally available in a Knack app.

Components or pages you make can be published back to your Knack app using the instructions in [plasmic-codegen-into-html-with-vite](https://github.com/CallumBoase/plasmic-codegen-into-html-with-vite).

## Getting started

1. In the Plasmic web interface:
    1. Create a new Plasmic app
    2. Rename your app
    3. Click "Publish" button at top-right
    4. Add a "Push to Github" step, publishing to a new repo, nextjs, loader (recommended) method, typescript
    5. Click "publish" and wait for the build to complete

1. Clone or fork this repo
2. Go to `package.json` and set "name" to whatever you want to call your component library
3. Run `npm install` to install dependencies

## How to use
1. Add your own components to the `src` folder instead of the example component.
2. Export your components in `src/index.ts` like the example
3. Run `npm run build` to build the library. It will be built in the `dist` folder

## Testing in a Plasmic nextjs Pages router app

In this project
1. Follow steps 1-3 in the `How To use` section above
2. Run `npm pack` to package the library to .tgz (which simulates what happens when you live-publish to npm but just saves a local file you can npm install later)

In your Plasmic project
1. Make sure you've already got a repo set up, connected with a Plasmic app and that your Plasmic app is using your app as it's custom app host
2. (If previously installed) Uninstall the library (`npm uninstall your-library-name`)
3. Run `npm install ./path/to/your-library-name-X.X.X.tgz` to install the library based on the local .tgz file
4. If CSS is used in your component/s: create an `_app.tsx` file in `./pages/_app.tsx` and import your CSS files as required
  * If using codegen nextjs
    ```typescript
    import { PlasmicRootProvider } from "@plasmicapp/react-web";
    import type { AppProps } from "next/app";
    import Head from "next/head";
  
    //Here we import the CSS from your library
    import 'your-library-name/dist/path/to/css/file';
  
    export default function MyApp({ Component, pageProps }: AppProps) {
      return (
        <PlasmicRootProvider Head={Head}>
          <Component {...pageProps} />
        </PlasmicRootProvider>
      );
    }
    ```
  * If using loader API with nextjs
    ```typescript
    import type { AppProps } from "next/app";

    //Here we import the bundled CSS from the library
    import 'your-library-name/dist/path/to/css/file';
    
    export default function MyApp({ Component, pageProps }: AppProps) {
      return (
        <Component {...pageProps} />
      );
    }
    ```
5. Register the components for use in plasmic studio.
 * If using codegen with nextjs, `plasmic-host.tsx`:
   ```typescript
   import * as React from 'react';
   import { PlasmicCanvasHost, registerComponent } from '@plasmicapp/react-web/lib/host';
 
   import { YourComponent, yourComponentMeta } from "your-library-name";
 
   registerComponent(YourComponent, yourComponentMeta);
 
   export default function PlasmicHost() {
     return <PlasmicCanvasHost />;
   }
   ```
 * If using loader API with nextjs, `plasmic-init.ts`:
    ```typescript
    import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";

    import { YourComponent, yourComponentMeta } from "your-library-name";
    
    export const PLASMIC = initPlasmicLoader({
      projects: [
        {
          id: "your-project-id",
          token: "your-project-token",
        },
      ],
    
      preview: false,
    });

    PLASMIC.registerComponent(YourComponent, yourComponentMeta);
   ```

## Publishing

Once ready, you can publish to npm
1. Change version number in `package.json`
2. Run `npm publish` in terminal
3. Recommended: in your github repo create a release and tag corresponding with the commit that you published
