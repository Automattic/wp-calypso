# Material design icons

This package currently only provides Material icon SVGs required by the Calypso
nav drawer. The official `material-design-icons` package (<https://github.com/google/material-design-icons>)
is generally quite out-dated. It also includes many image formats that are not
relevant to Calypso.

As we adopt Material icons more widely, it will probably be worthwhile to fully
populate this package with all the available icons. Alternatively, we could seek
out an alternative distribution of the icons.

## Using a Material icon in Calypso

We use svgr to load SVG files and convert them to React components.

```jsx
import { ReactComponent as SvgExample } from './test.svg';

<SvgExample />;
```

## Adding icons

To add more Material Design icons, you'll have to download individual icons to appropriate directories
then rebuild and checkin updated `material-icons.svg` file.

Select and download individual icon's SVG file from <https://material.io/tools/icons/>,
minding the style (like `outline`) and size.

Move the SVG files in the sub-folder matching the category used on material.io.

Rebuild `material-icons.svg` by running:

```bash
yarn workspace @automattic/material-design-icons run build
```

Beware that default style and size for `MaterialIcon` class is `outline` and `24`.
