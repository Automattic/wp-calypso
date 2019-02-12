Publishing Packages with the Monorepo
=====================================

Caplyso is a monorepo. In addition to the Calypso application, it also hosts a number of independent modules that are published to NPM. 

## Module Layout

These modules live under the `packages` directory, one folder per module.

Modules should follow a our convention for layout:
```
# your package.json
package.json
  # with these properties
  main: dist/cjs/index.js
  module: dist/esm/index.js
  sideEffects: false

# a readme for your module
README.md

# source code lives here
src/
  # exports everything the modules offers
  index.js

  # individual modules, imported by index.js 
  module-a.js
  module-b.js

# tests for the module
test/
  index.js
  module-a.js
  module-b.js
```

Our package compiler will automatically compile code in `src` to `dist`, running `babel` over any source files it finds.

## Running Tests
To run all of the package tests:

`npm run test-packages`

To run one package's tests:

`npm run test-packages -- (package folder)`

## Publishing

To publish everything currently out of date:

`npx lerna publish from-package`

TODO: To publish a canary release of a package:

TODO: To publish one package