PragmaCheckPlugin
================

This `webpack` plugin scans Calypso source code for the `@ssr-ready` pragma, and reports any dependencies that don't have this pragma.

It is intended to provide immediate runtime feedback to developers modifying components used in Server Side Rendering, where adding a non-compatible dependency may break the server build.

