# Command Palette (WP Admin)

This app provides a regular global JS function that renders the command palette from `@automattic/command-palette` in a given node. This way, we can load the command palette on a WP Admin context.

## External dependencies

Dependencies that are globally available on all WP sites (e.g. `@wordpress/components`, `@wordpress/url`, etc.) are not included in the bundled build to optimize its size. We need to declare these dependencies though when enqueueing the build in the `jetpack-mu-wpcom` package, so remember to keep [this list](https://github.com/Automattic/jetpack/blob/97b0d2e4091028e19d162cbdf1221a518dc4fa9d/projects/packages/jetpack-mu-wpcom/src/features/wpcom-command-palette/wpcom-command-palette.php#L45-L54) updated if you ever need to change the dependencies.
