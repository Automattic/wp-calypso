SiteRedirectData
================

A component that fetches a site redirect's related data and passes it to its children.

## Usage

Pass a component through the `component` prop of `<SiteRedirectData />`. `SiteRedirectData` will pass data to the given `component` prop, which is mounted as a child.
It will handle the data itself thus helping us to decouple concerns: i.e. fetching and displaying data. This pattern is also called [container components](https://medium.com/@learnreact/container-components-c0e67432e005).

```js
import React from 'react';
import SiteRedirectData from 'components/data/domain-management/site-redirect';
import MyChildComponent from 'components/my-child-component';

// initialize rest of the variables

const MyComponent = React.createClass( {
	render() {
		return (
			<SiteRedirectData
				component={ MyChildComponent }
				selectedDomainName={ selectedDomainName } />
		);
	}
} );

export default MyComponent;
```

The component expects to receive all listed props:

* `component` - mentioned above
* `selectedDomainName` - the domain name currently selected 

The child component should receive processed props defined during the render:

* `selectedDomainName` - the domain name currently selected 
* `selectedSite` - the site currently selected  

As well as:

* `location` - a site redirect's location, it's the result of a call to `SiteRedirectStore.getBySite` for the current site  

It's updated whenever `SiteRedirectStore` changes.
