# Query Connected Applications

`<QueryConnectedApplications />` is a React component used to request the connected applications of the current user.

## Usage

Render the component without props. It does not accept any children, nor does it render any elements to the page.

```jsx
import React, { Fragment } from 'react';
import QueryConnectedApplications from 'calypso/components/data/query-connected-applications';

export default () => (
	<Fragment>
		<QueryConnectedApplications />
	</Fragment>
);
```
