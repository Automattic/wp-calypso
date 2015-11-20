PageTemplatesData
=================

PageTemplatesData is a data component that fetches Page Templates for a given site and passes the data into a child component.

Usage
-----

Wrap a child component with `<PageTemplatesData />`, passing a `siteId`. [As a controller-view](https://facebook.github.io/flux/docs/overview.html#views-and-controller-views), and PageTemplatesData will pass data into its child component as props.

```jsx
import React from 'react';
import PageTemplatesData from 'components/data/page-templates-data';
import MyChildComponent from './my-child-component';

export default React.createClass( {
	displayName: 'MyComponent',

	render() {
		return (
			<PageTemplatesData siteId={ this.props.siteId }>
				<MyChildComponent />
			</PageTemplatesData>
		);
	}
} );
```

The child component should expect to receive any props defined during the render, as well as the following additional props:

-	`pageTemplates`: An array of Page Templates data as returned from the API. Each template is represented as an object with this shape:

```js
{
	file: "example-file.php",
	label: "Template Example"
}
```

-	`isFetchingPageTemplates`: A boolean of whether the component is actively fetching data.
-	`isInitializedPageTemplates`: A boolean of whether the component has fetched data for this given instance.
