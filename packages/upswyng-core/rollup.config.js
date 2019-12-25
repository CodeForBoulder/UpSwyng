import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import resolve from "rollup-plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";

module.exports = {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
    },
    {
      file: pkg.module,
      format: "es",
    },
  ],
  plugins: [
    resolve({
      only: ["rrule"],
      mainFields: ["main"],
    }),
    // All the other modules besides 'rrule' should be resolved with the default entrypoint priority. (Defaults
    // to ['module', 'main'].) See: https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({
      only: [/^(?!.*rrule).*$/],
      preferBuiltins: false,
    }),
    typescript({ tsconfig: "./tsconfig.build.json" }),
    commonjs({
      include: /node_modules/,
      exclude: [/^.+\.tsx?$/],
      namedExports: { rrule: ["RRule", "RRuleSet"], bson: ["ObjectId"] },
    }),
    json(),
  ],
  // external: [
  //   ...Object.keys(pkg.dependencies || {}),
  //   ...Object.keys(pkg.peerDependencies || {}),
  // ],
};
