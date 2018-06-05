DomainManagementData
====================

## Components list

This folder contains the following components:

* `DomainManagementData`
* `DnsData`
* `EmailData`
* `EmailForwardingData`
* `NameserversData`
* `SiteRedirectData`
* `TransferData`
* `WhoisData`

## Main component

`DomainManagementData` - a component, located directly in this folder, that fetches a site's domains and cart content, then passes them to its children.

## Usage

Pass a component as a child of `<DomainManagementData />`. `DomainManagementData` will pass data to the given component, which is mounted as a child.
It will handle the data itself thus helping us to decouple concerns: i.e. fetching and displaying data. This pattern is also called [container components](https://medium.com/@learnreact/container-components-c0e67432e005).

```js
import React from 'react';
import DomainManagementData from 'components/data/domain-management';
import MyChildComponent from 'components/my-child-component';

// initialize rest of the variables

class MyComponent extends React.Component {
	render() {
		return (
			<DomainManagementData
				component={ MyChildComponent }
				context={ context }
				productsList={ productsList }
				sites={ sites } />
		);
	}
}

export default MyComponent;
```

The component expects to receive all listed props:

* `context` - a request context
* `productsList` - a collection of all the products users can have on WordPress.com
* `selectedDomainName` - the domain name currently selected (optional)
* `sites` - a list of user sites 

The child component should receive processed props defined during the render:

* `context` - a request context
* `products` - a collection of all the products users can have on WordPress.com
* `selectedDomainName` - the domain name currently selected (optional)
* `selectedSite` - the site currently selected 

As well as:

* `cart` - products added to the cart, it's the result of a call to `CartStore.get`  
* `domains` - a list of domains we get using `<QuerySiteDomains />` component (Redux)

It's updated whenever CartStore`, `domains`, `productsList` or `sites` changes.
