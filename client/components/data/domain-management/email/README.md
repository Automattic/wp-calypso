EmailData
============

A component that fetches a domain's email related data and passes it to its children.

## Usage

Pass a component through the `component` prop of `<EmailData />`. `EmailData` will pass data to the given `component` prop, which is mounted as a child.
It will handle the data itself thus helping us to decouple concerns: i.e. fetching and displaying data. This pattern is also called [container components](https://medium.com/@learnreact/container-components-c0e67432e005).

```js
import React from 'react';
import EmailData from 'components/data/domain-management/email';
import MyChildComponent from 'components/my-child-component';

// initialize rest of the variables

class MyComponent extends React.Component {
	render() {
		return (
			<EmailData
				component={ MyChildComponent }
				productsList={ productsList }
				selectedDomainName={ selectedDomainName }
				context={ context }
				sites={ sites } />
		);
	}
}

export default MyComponent;
```

The component expects to receive all listed props:

* `component` - mentioned above
* `context` - a request context
* `productsList` - a collection of all the products users can have on WordPress.com
* `selectedDomainName` - the domain name currently selected 
* `sites` - a list of user sites 

The child component should receive processed props defined during the render:

* `context` - a request context
* `products` - a collection of all the products users can have on WordPress.com
* `selectedDomainName` - the domain name currently selected 
* `selectedSite` - the site currently selected  
* `user` - a current user object 

As well as:

* `cart` - products added to the cart, it's the result of a call to `CartStore.get`  
* `domains` - a list of domains we get using `<QuerySiteDomains />` component (Redux)
* `googleAppsUsers` - Google Apps users, it's the result of a call to `GoogleAppsUsersStore.getByDomainName` for the current domain

It's updated whenever `CartStore`, `domains`, `GoogleAppsUsersStore`, `productsList` or `sites` changes.
