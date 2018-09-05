# Packages

This directory exists to hold a variety of projects and libraries that we use in Calypso but also might publish as independent outputs or packages. For now it's empty but we expect a number of separate subdirectories soon.

## Adding a new package?

If you want to add a new project or package into this directory then follow these guidelines to help others who might stumble upon it later.

1. Create a subdirectory with an appropriate descriptive name for what you are writing; contain all of your code in that subdirectory.
2. Add a `README.md` file in that subdirectory explaining what the package is, why it exists, how to install it, and how to use it.
3. Add a terse one-line description and link to the `README.md` file from this page.

When writing code inside of this directory you may import existing code from Calypso or from other packages. Please import with the appropriate aliased module names - do not import with relative or absolute paths.

```scss
@import '@calypso-style/colors.scss';

.is-annoying {
	color: $alert-red;
}
```

```js
import wpcom from '@calypso-packages/wpcom-js';
import Button from '@calypso-app/components/button';
```

## Packages

 - who will share the first one?
