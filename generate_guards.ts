import { parse as parseFlags } from "https://deno.land/std/flags/mod.ts";
import { parse as parseTs } from "https://github.com/nestdotland/deno_swc/raw/master/mod.ts";
import {
  ModuleItem,
  Program,
  Statement,
} from "https://github.com/nestdotland/deno_swc/raw/master/types/options.ts";

// If running in the command line
if (import.meta.main === true) {
  // Parse command line arguments
  const args = parseFlags(Deno.args, {
    alias: {
      "h": "help",
    },
  });

  if (args.help === true) {
    console.log(`Generates the generated_guards.ts file.

USAGE

    deno --unstable run --allow-read --allow-write generate_guards.ts

BEHAVIOR

    Parses guards.ts using SWC and removes 'export' statements. Then take this
    modified AST and saves it in the generated_guards.ts file in the form of 
    a variable.

    The reason we must generate this code is the following: We want to be able to
    test the individual type guards using normal testing techniques (Which we do in
    the guards_test.ts file). However we also want their source code to be available
    so that we can place it in files which the denoguard tool will generate for 
    users. If we did not generate generated_guards.ts the original source code would
    not be available at run time. This is because Typescript is transpiled into
    Javascript, thus removing its type information, and then bundled by Deno into 
    one large source file. So we must explicitly include it in the memory of our
    code in the form of a variable in generated_guards.ts.
`);
    Deno.exit(0);
  }

  // Parse guards.ts file
  const srcTxt = await Deno.readTextFile("guards.ts");
  const ast = parseTs(srcTxt, {
    syntax: "typescript",
  });
  const nodes: (ModuleItem[] | Statement) = ast.body;

  // Transform AST
  const transformed = nodes.map((node) => {
    // Remove export declarations
    if (node.type === "ExportDeclaration") {
      return node.declaration;
    }

    // Don't touch everything else
    return node;
  });

  console.log(JSON.stringify(transformed, null, 4));

  // Save into generated file
  let out = `\
/***********************************************************************
 * !! THIS FILE IS AUTOMATICALLY GENERATED USING generate_guards.ts !! *
 * !! ANY CHANGES MADE WILL NOT BE KEPT. MODIFY guards.ts INSTEAD   !! *
 ***********************************************************************/

import {
  FunctionDeclaration,
  TsKeywordType,
} from "https://github.com/nestdotland/deno_swc/raw/master/types/options.ts";

/**
 * Defines information about a type guard which can be used for code 
 * generation purposes.
 */
interface GeneratedTypeGuard {
  /**
   * Name of the type guard function.
   */
  name: string;

  /**
   * Abstract syntax tree of type guard function.
   */
  ast: FunctionDeclaration;

  /**
   * The Typescript type kind which this function ensures.
   */
  kind: TsKeywordType;
}

const guards: Map<string, GeneratedTypeGuard> = {}; // TODO
`;
}