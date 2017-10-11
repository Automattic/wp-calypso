*Navigation Back Button*

This component is used to display a `Back` button for redirection to the previously
visited site.

#Example Usage:

```js
import React from 'react';

import NavigationBackButton from 'components/navigation-back-button';

/* ... */

const MyComponent = ( { siteSlug } ) => (
	<span className="/*...*/">
			<NavigationBackButton redirectRoute={ '/settings/manage-connection/' + siteSlug } />
	</span>
);

export default MyComponent;
```

#Props (required):

- `redirectRoute` -- destination redirect route (string)
