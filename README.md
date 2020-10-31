# Denoguard
Deno based type guard code generator.

# Table Of Contents
- [Overview](#overview)
- [Code Generation](#code-generation)

# Overview
Type guard code generation tool written for DenoJs.

# Code Generation
This tool parses source files for interface definitions using the same parser 
that Deno uses ([SWC](https://github.com/swc-project/swc)). It then generates
[Typescript type guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html) 
for these interfaces. The type guards are named `is<interface name>` 
(The `<interface name>` will have it's first letter capitalized).

Interface type guards are constructed by combining smaller pre-defined and 
tested type guards, which we will call sub type guards. Each of these
sub type guards test one property of an unknown type. The code generator 
determines what properties of an interface need to be tested and combines the 
appropriate sub type guards together to satisfy an interface's requirements.

These sub type guards reside in the [`guards.ts`](./guards.ts) file. When 
Denoguard itself is built this `guard.ts` file is parsed (using the same 
SWC Typescript parser) and each sub type guard's abstract syntax tree is 
slightly transformed. The transformation ensures the sub type guard functions
are ready for code generation purposes by removing `export` keywords from before
function definitions. Then in preparation for Denoguard code generation the 
resulting sub type guard's Typescript source code strings are saved to the 
`guards_generated.ts` file, which will included in the final Denoguard 
bundle distribution.

This process ensures that type guards can be tested and are reliable.
