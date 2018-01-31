EmailForwardingData
===================

A component that fetches a domain's email forwarding related data and passes it to its children.

## Usage

Pass a component through the `component` prop of `<EmailForwardingData />`. `EmailForwardingData` will pass data to the given `component` prop, which is mounted as a child.
It will handle the data itself thus helping us to decouple concerns: i.e. fetching and displaying data. This pattern is also called [container components](https://medium.com/@learnreact/container-components-c0e67432e005).

```js
import React from 'react';
import EmailForwardingData from 'components/data/domain-management/email-forwarding';
import MyChildComponent from 'components/my-child-component';

// initialize rest of the variables

class MyComponent extends React.Component {
	render() {
		return (
			<EmailForwardingData
				component={ MyChildComponent }
				selectedDomainName={ selectedDomainName }
				sites={ sites } />
		);
	}
}

export default MyComponent;
```

The component expects to receive all listed props:

* `component` - mentioned above
* `selectedDomainName` - the domain name currently selected 
* `sites` - a list of user sites 

The child component should receive processed props defined during the render:

* `selectedDomainName` - the domain name currently selected 
* `selectedSite` - the site currently selected  

As well as:

* `emailForwarding` - email forwarding data, it's the result of a call to `EmailForwardingStore.getByDomainName` for the current domain  

It's updated whenever `EmailForwardingStore` or `sites` changes.
