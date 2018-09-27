The plugins directory is for Gutenberg blocks being developed in the `wp-calypso` repo using the Gutenberg SDK. Plugin developers create a directory for each plugin containing the PHP file(s). The SDK should target a `build` directory within the plugin directory. 

Example SDK usage:

`npm run sdk -- gutenberg client/gutenberg/extensions/presets/my-preset -output-dir=client/gutenberg/extensions/plugins/my-plugin/build -w`

Example directory structure:

└───plugins
    └───my-plugin
    	└───plugin.php
        └───build
            ├───editor.css
            ├───editor.js
            ├───editor.rtl.css
            ├───view.cc
            ├───view.js
            └───view.rtl.css

