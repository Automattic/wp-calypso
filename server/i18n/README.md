I18n
=========

Node module and command-line-interface to parse through a javascript input file, build a list of translation requests, and recreate those translation requests using WordPress i18n php functions. The output file is saved as a php file with a named array of WordPress-formatted i18n requests that can be imported back into the WordPress codebase, ultimately getting the strings into GlotPress for translation. You can either call this directly from the command line or you can use this module directly in node. The first argument is the name of the file to generate, the second argument is the name of a php array to create inside the output file, which contains WordPress-formatted i18n functions.  The third and subsequent arguments name files to parse.

```
# Command line
$ bin/get-i18n calypso-strings-example-output.php calypso_i18n_strings build/bundle-development.js

# Node
var geti18n = require( 'get-i18n' );
geti18n( './calypso-strings.php', 'calypso_i18n_strings', [ './public/build-stage.js' ] );

# Sample Output
<?php
$calypso_i18n_strings = array (
  __( ' Example1 ' ),
  __( ' Example2 ' ),
);
```

This module is implemented in the root Makefile, so you can simply use `make translate` from the project root to run this module from the terminal. It will build `/public/build-stage.js`, which is a concatenated string of all client-side javascript files, parse through `build-stage.js` to find all instances of `translate()`, and generate a `./calypso-strings.php` file of WordPress-formatted translation functions inside an array named `$calypso_i18n_strings`. For now this file would need to be added to the WordPress codebase manually.
