# DomainManagementData

A component that fetches data based on given props and then passes them to its children.

## Usage

Pass a component as a child of `<DomainManagementData />`. `DomainManagementData` will pass data to the given component, which is mounted as a child.
It will handle the data itself thus helping us to decouple concerns: i.e. fetching and displaying data. This pattern is also called [container components](https://medium.com/@learnreact/container-components-c0e67432e005).

```js
import DomainManagementData from 'calypso/components/data/domain-management';
import MyChildComponent from 'calypso/components/my-child-component';

// initialize rest of the variables

const MyComponent = () => (
	<DomainManagementData component={ MyChildComponent } context={ context } needsDomains />
);

export default MyComponent;
```

Currently we use Redux. Props for loading data:

- `needsDomains` - Loads domain for currently selected site
- `needsPlans` - Loads plans for given site
- `needsProductsList` - Loads products list

The child component should receive processed props defined in `getStateFromStores()`. It's updated whenever the data it needs changes.
