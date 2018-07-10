# withConstrainedTabbing

`withConstrainedTabbing` is a React [higher-order component](https://facebook.github.io/react/docs/higher-order-components.html) adding the ability to constrain keyboard navigation with the Tab key within a component. For accessibility reasons, some UI components need to constrain Tab navigation, for example modal dialogs or similar UI. Use of this component is recommended only in cases where a way to navigate away from the wrapped component is implemented by other means, usually by pressing the Escape key or using a specific UI control, e.g. a "Close" button.

## Usage

Wrap your original component with `withConstrainedTabbing`.
