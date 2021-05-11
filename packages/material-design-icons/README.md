# Material design icons

This package currently only provides Material icon SVGs required by the Calypso
nav drawer. The official `material-design-icons` package (<https://github.com/google/material-design-icons>)
is generally quite out-dated. It also includes many image formats that are not
relevant to Calypso.

As we adopt Material icons more widely, it will probably be worthwhile to fully
populate this package with all the available icons. Alternatively, we could seek
out an alternative distribution of the icons.

## Using a Material icon in Calypso

We use `svgr` to load SVG files and convert them to React components:

```jsx
import { ReactComponent as SvgExample } from './test.svg';

<SvgExample />;
```

## Adding a Material icon

To add more icons, you'll have to download individual icons to the appropriate directories,
then rebuild and commit the updated sprites file:

  1. Select an icon from the [official repository](https://fonts.google.com/icons?selected=Material+Icons), minding the style (like `outline`)

  2. Download the corresponding SVG file with `black` as color

  3. Move that SVG file in the sub-folder matching the category of that icon

  4. Rebuild `material-icons.svg` by running:
     ```bash
     yarn workspace @automattic/material-design-icons run build
     ```

Beware that default style and size for the `MaterialIcon` class is `outline` and `24`.
