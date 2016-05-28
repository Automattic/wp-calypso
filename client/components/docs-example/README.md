DocsExample
===========

This component is used to implement a skeleton for components examples which are generally showcased in the devdocs.

#### How to use:

```js
import DocsExample from 'components/docs-example';

render: function() {
  return (
    <DocsExample
      title="My Component"
      url="/devdocs/design/my-component"
      usageStats={ this.props.usageStats }
      toggleHandler={ this.toggleMyComponent }
      toggleText={ toggleText }
    >
      { this.renderExamples() }
    </DocsExample>
  );
}
```

#### Props

* `title`: (string) A title for the example, usually the component name.
* `url`: (string) Url to the component page in the docs.
* `usageStats`: (object) An object containing the usage stats e.g. `{ count: 10 }`.
* `toggleHandler`: (func) A function to toggle the example state.
* `toggleText`: (string) Text for the toggle button.
