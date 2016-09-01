Dismissable Card
=========
This is a card component that can be dismissed for a single page load or be hidden
via user preference.

#### How to use:

```js
import DismissableCard from 'blocks/dismissable-card';
import QueryPreferences from 'components/data/query-preferences';

render: function() {
  return (
    <div className="your-stuff">
      <QueryPreferences />
      <DismissableCard preferenceName="my-unique-preference-name">
        <span>Your stuff in a Card</span>
      </DismissableCard>
    </div>
  );
}
```

## Props

Below is a list of supported props.

### `className`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>undefined</code></td></tr>
</table>

Any addition classes to pass to the card component.

### `onClick`

<table>
	<tr><td>Type</td><td>Function</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>lodash/noop</code></td></tr>
</table>

This function will fire when a user clicks on the cross icon

### `preferenceName`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>Yes</td></tr>
	<tr><td>Default</td><td><code>n/a</code></td></tr>
</table>

The user preference name that we store a boolean against. 
Note that we prefix this value with 'dismissable-card-' to avoid namespace collisions.

### `temporary`

<table>
	<tr><td>Type</td><td>Boolean</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>undefined</code></td></tr>
</table>

When true, clicking on the cross will dismiss the card for the current page load.