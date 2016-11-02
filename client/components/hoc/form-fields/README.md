Form Fields Higher Order Component
==================================

This HoC provides an alternative to `dirtyLinkedState` mixin for ES6 React component and functional components.

Usage
-----

```javascript
  const MyComponent = ({ fields, dirtyFields, updateFields, clearDirtyFields }) => {

    const submit = () => {
      const updatedFields = omit(fields, dirtyFields);
      // Do what you want with fields and dirtyFields

      clearDirtyFields();
    };

    const updateName = event => {
      updateFields({
        name: event.target.value
      });
    };

    return (
      <Form onSubmit={ submit }>
        <FormInput value={ fields.name } onChange={ updateName } />
      </Form>
    );
  }
```

This HoC exposes four props to the wrapped Component.


### `fields`

<table>
	<tr><th>Type</th><td>Object</td></tr>
	<tr><th>Default</th><td><code>{}</code></td></tr>
</table>

The current values of the form fields

### `dirtyFields`

<table>
	<tr><th>Type</th><td>Object</td></tr>
	<tr><th>Default</th><td><code>{}</code></td></tr>
</table>

The fields which have been updated since mounting or since the last call to `clearDirtyFields`

### `updateFields`

<table>
	<tr><th>Type</th><td>Function</td></tr>
</table>

A function that takes a key/value pairs. We call it to update the field values.

### `clearDirtyFields`

<table>
	<tr><th>Type</th><td>Function</td></tr>
</table>

A function we call to clear the dirty fields
