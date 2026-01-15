# DataViews Component

This component is a wrapper around WordPress's `@wordpress/dataviews` package. It extends the core DataViews component with Multi-site dashboard specific functionality.

## Exports

The `index.tsx` file exports the following components:

- **`DataViews`** - The main wrapper component that extends WordPress's DataViews with additional props like `onResetView` and view sanitization
- **`DataViewsCard`** - A card wrapper component for DataViews content
- **`DataViewsEmptyState`** - A custom empty state component for use with DataViews

### When to Use

- Use `DataViews` when you need a data table view with sorting, filtering, and pagination capabilities
- Use `DataViewsCard` when you want to wrap your DataViews content in a card container
- Use `DataViewsEmptyState` when displaying an empty state within a DataViews layout

## Important: Upstream Contributions

These files are necessary extensions to WordPress's DataViews component. **Before making any changes to these components, please consider whether the changes can be contributed upstream to the WordPress core package** (`@wordpress/dataviews`) instead of being maintained as local modifications. This helps reduce maintenance burden and benefits the broader WordPress community.

If a change is truly Multi-site dashboard specific and cannot be upstreamed, document the reason in the code or commit message.

## CSS Styles

**We do not want custom styles for this component.** The DataViews component should rely on the default styles provided by the `@wordpress/dataviews` package. If you find that custom styles are necessary, they should be considered temporary and documented as such. The goal is to work with the upstream package's styling system rather than maintaining custom overrides.
