<!-- Learn how to maintain this file at https://github.com/WordPress/gutenberg/tree/HEAD/packages#maintaining-changelogs. -->

## Unreleased

## 4.21.0 (2025-06-04)

## 4.20.0 (2025-05-22)

## 4.19.0 (2025-05-07)

## 4.18.0 (2025-04-11)

## 4.17.0 (2025-03-27)

## 4.16.0 (2025-03-13)

## 4.15.0 (2025-02-28)

## 4.14.0 (2025-02-12)

## 4.13.0 (2025-01-29)

## 4.12.0 (2025-01-15)

## 4.11.0 (2025-01-02)

### Bug Fixes

-   Fixed commonjs export ([#67962](https://github.com/WordPress/gutenberg/pull/67962))

### Features

- Add support for hierarchical visualization of data. `DataViews` gets a new prop `getItemLevel` that should return the hierarchical level of the item. The view can use `view.showLevels` to display the levels. It's up to the consumer data source to prepare this information.

## 4.10.0 (2024-12-11)

### Breaking Changes

-   Support showing or hiding title, media and description fields ([#67477](https://github.com/WordPress/gutenberg/pull/67477)).
-   Unify the `title`, `media` and `description` fields for the different layouts. So instead of the previous `view.layout.mediaField`, `view.layout.primaryField` and `view.layout.columnFields`, all the layouts now support these three fields with the following config ([#67477](https://github.com/WordPress/gutenberg/pull/67477)):

```js
const view = {
	type: 'table',
	titleField: 'title',
	mediaField: 'media',
	descriptionField: 'description',
	fields: [ 'author', 'date' ],
};
```

### Internal

-   Upgraded `@ariakit/react` (v0.4.13) and `@ariakit/test` (v0.4.5) ([#65907](https://github.com/WordPress/gutenberg/pull/65907)).
-   Upgraded `@ariakit/react` (v0.4.15) and `@ariakit/test` (v0.4.7) ([#67404](https://github.com/WordPress/gutenberg/pull/67404)).

## 4.9.0 (2024-11-27)

### Bug Fixes

-   Fix focus loss when removing all filters or resetting ([#67003](https://github.com/WordPress/gutenberg/pull/67003)).

## 4.8.0 (2024-11-16)

## 4.7.0 (2024-10-30)

## 4.6.0 (2024-10-16)

-   Invert the logic for which icon to show in `DataViews` when using the filter view. Icons now match the action of the button label. ([#65914](https://github.com/WordPress/gutenberg/pull/65914)).

## 4.5.0 (2024-10-03)

## 4.4.0 (2024-09-19)

## 4.3.0 (2024-09-05)

## 4.2.0 (2024-08-21)

## New features

-   Support using a component for field headers or names by providing a `header` property in the field object. The string `label` property (or `id`) is still mandatory. ([#64642](https://github.com/WordPress/gutenberg/pull/64642)).

## Internal

-   The "move left/move right" controls in the table layout (popup displayed on cliking header) are always visible. ([#64646](https://github.com/WordPress/gutenberg/pull/64646)). Before this, its visibility depending on filters, enableSorting, and enableHiding.
-   Filters no longer display the elements' description. ([#64674](https://github.com/WordPress/gutenberg/pull/64674))

## Enhancements

-   Adjust layout of filter / actions row, increase width of search control when the container is narrower. ([#64681](https://github.com/WordPress/gutenberg/pull/64681)).

## 4.1.0 (2024-08-07)

## Internal

-   Upgraded `@ariakit/react` (v0.4.7) ([#64066](https://github.com/WordPress/gutenberg/pull/64066)).

## 4.0.0 (2024-07-24)

### Breaking Changes

-   `onSelectionChange` prop has been renamed to `onChangeSelection` and its argument has been updated to be a list of ids.
-   `setSelection` prop has been removed. Please use `onChangeSelection` instead.
-   `header` field property has been renamed to `label`.
-   `DataForm`'s `visibleFields` prop has been renamed to `fields`.
-   `DataForm`'s `onChange` prop has been update to receive as argument only the fields that have changed.

### New features

-   Support multiple layouts in `DataForm` component and introduce the `panel` layout.

## 3.0.0 (2024-07-10)

### Breaking Changes

-   Replace the `hiddenFields` property in the view prop of `DataViews` with a `fields` property that accepts an array of visible fields instead.
-   Replace the `supportedLayouts` prop in the `DataViews` component with a `defaultLayouts` prop that accepts an object whose keys are the layout names and values are the default view objects for these layouts.

### New features

-   Added a new `DataForm` component to render controls from a given configuration (fields, form), and data.

### Internal

-   Method style type signatures have been changed to function style ([#62718](https://github.com/WordPress/gutenberg/pull/62718)).

## 2.2.0 (2024-06-26)

## 2.1.0 (2024-06-15)

## 2.0.0 (2024-05-31)

### Breaking Changes

-   Legacy support for `in` and `notIn` operators introduced in 0.8 .0 has been removed and they no longer work. Please, convert them to `is` and `isNot` respectively.
-   Variables like `process.env.IS_GUTENBERG_PLUGIN` have been replaced by `globalThis.IS_GUTENBERG_PLUGIN`. Build systems using `process.env` should be updated ([#61486](https://github.com/WordPress/gutenberg/pull/61486)).
-   Increase the minimum required Node.js version to v18.12.0 matching long-term support releases ([#31270](https://github.com/WordPress/gutenberg/pull/61930)). Learn more about [Node.js releases](https://nodejs.org/en/about/previous-releases).

### Internal

-   Remove some unused dependencies ([#62010](https://github.com/WordPress/gutenberg/pull/62010)).

### Enhancements

-   `label` prop in Actions API can be either a `string` value or a `function`, in case we want to use information from the selected items. ([#61942](https://github.com/WordPress/gutenberg/pull/61942)).
-   Add `registry` argument to the callback of the actions API. ([#62505](https://github.com/WordPress/gutenberg/pull/62505)).

## 1.2.0 (2024-05-16)

### Internal

-   Replaced `classnames` package with the faster and smaller `clsx` package ([#61138](https://github.com/WordPress/gutenberg/pull/61138)).

## 1.1.0 (2024-05-02)

## 1.0.0 (2024-04-19)

### Breaking Changes

-   Removed the `onDetailsChange` event only available for the list layout. We are looking into adding actions to the list layout, including primary ones.

## 0.9.0 (2024-04-03)

### Enhancements

-   The `enumeration` type has been removed and we'll introduce new field types soon. The existing filters will still work as before given they checked for field.elements, which is still a condition filters should have.

## 0.8.0 (2024-03-21)

### Enhancements

-   Two new operators have been added: `isAll` and `isNotAll`. These are meant to represent `AND` operations. For example, `Category is all: Book, Review, Science Fiction` would represent all items that have all three categories selected.
-   DataViews now supports multi-selection. A new set of filter operators has been introduced: `is`, `isNot`, `isAny`, `isNone`. Single-selection operators are `is` and `isNot`, and multi-selection operators are `isAny` and `isNone`. If no operators are declared for a filter, it will support multi-selection. Additionally, the old filter operators `in` and `notIn` operators have been deprecated and will work as `is` and `isNot` respectively. Please, migrate to the new operators as they'll be removed soon.

### Breaking Changes

-   Removed the `getPaginationResults` and `sortByTextFields` utils and replaced them with a unique `filterSortAndPaginate` function.

## 0.7.0 (2024-03-06)

## 0.6.0 (2024-02-21)

## 0.5.0 (2024-02-09)

## 0.4.0 (2024-01-24)

## 0.3.0 (2024-01-10)

## 0.2.0 (2023-12-13)
