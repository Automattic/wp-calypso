# WordPress external dependencies plugin

This webpack plugin serves two purposes:

- Externalize dependencies that are available as script dependencies on modern WordPress sites.
- Add a JSON file for each entrypoint that declares the WordPress script dependencies for the
  entrypoint.

This allows JavaScript bundles produced by webpack to leverage WordPress style dependency sharing
without an error-prone process of manually maintaining a dependency list.

Consult the [webpack website](https://webpack.js.org) for additional information on webpack concepts.

## Usage

### Webpack

Use this plugin as you would other webpack plugins:

```js
// webpack.config.js
const WordPressExternalDependenciesPlugin = require( '@automattic/wordpress-external-dependencies-plugin' );

module.exports = {
  // …snip
  plugins: [
    new WordPressExternalDependenciesPlugin(),
  ]
}
```

Each entrypoint in the webpack bundle will include JSON file that declares the WordPress script dependencies that should be enqueued.

For example:

```
// Source file entrypoint.js
import { Component } from '@wordpress/element';

// Webpack will produce the output output/entrypoint.js
/* bundle JS output */

// Webpack will also produce output/entrypoint.deps.json declaring script dependencies
['wp-element']
```

### WordPress

Enqueue your script as usual and read the script dependencies dynamically:

```php
$script_path      = 'path/to/script.js';
$script_deps_path = 'path/to/script.deps.json';
$script_dependencies = file_exists( $script_deps_path )
	? json_decode( file_get_contents( $script_deps_path ) )
	: array();
$script_url = plugins_url( $script_path, __FILE__ );
wp_enqueue_script( 'script', $script_url, $script_dependencies );
```
