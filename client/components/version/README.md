Version
=======

Version is a React component for rendering a version number

## Usage

```jsx

import React from 'react';
import Version from 'components/version';

React.createClass( {
	render: function() {
		return <Version version={ 123 } icon="plugins" />;
	}
} );
```

## Props

The following props can be passed to the Version component:

### `version`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>Yes</td></tr>
</table>

The version number that you want to display
### `icon`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>No</td></tr>
</table>

The Gridicon you want to display next to the version. 
