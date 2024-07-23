import { CodeComponentMeta } from "@plasmicapp/host";
import type { ExampleComponentProps } from ".";

export const ExampleComponentMeta: CodeComponentMeta<ExampleComponentProps> = {
  name: "ExampleComponent",
  importPath: "./index",
  props: {
    whoToGreet: {
      type: "string",
      defaultValue: "World",
    },
  }
};