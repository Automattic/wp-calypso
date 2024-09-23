# Whats New App

This app provides a regular global JS function that renders the whats new from `@automattic/whats-new` in a given node. This way, we can load the whats new app on different context.

## External dependencies

Dependencies that are globally available on all WP sites (e.g. `@wordpress/components`, `@wordpress/url`, etc.) are not included in the bundled build to optimize its size. We need to declare these dependencies though when enqueueing the build in the `jetpack-mu-wpcom` package, so remember to keep [this list](https://github.com/Automattic/jetpack/blob/4d09351e8c36cb4be84b0a98870a3022fd21d080/projects/packages/jetpack-mu-wpcom/src/features/wpcom-whats-new/wpcom-whats-new.php#L50-L62) updated if you ever need to change the dependencies.
gi