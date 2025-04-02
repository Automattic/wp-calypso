### Shortcuts taken

- `@automattic/components` requires variables defined in `@automattic/calypso-color-schemes` but it shouldn't be necessary. Ideally the components should only use the WP color scheme variables or SASS variables from base-styles. To alleviate this we are defining the currently required variables in the root `style.scss`
- Importing SASS files seems to bring other unexpected CSS variables to our bundles (masterbar, sidebar), it also brings fonts (Recoleta, Noto) and some global classes. Why? Imports should ideally be explicit.