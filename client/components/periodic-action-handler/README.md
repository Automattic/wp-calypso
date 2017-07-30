Periodic Action Handler
===========================

The periodic action Handler component uses React lifecycle functions to abstract the subscription and unsubscription of periodic actions.

Its objective is to allow any other component to declaratively set the need for the execution of a periodic action. E.g declaredly set that they required a webservice to be pulled one time per minute.

For example, if a given component requires the plugins of the selected website to be fetched once each 30 seconds using this component that can be done in the following way:

```jsx
import { fetchPlugins } from 'state/plugins/installed/actions';
import { isRequestingForSites } from 'state/plugins/installed/selectors';
import PeriodicActionHandler from 'components/periodic-action-handler';
...
<PeriodicActionHandler
	periodicActionId={ `fetchPlugins-${ this.props.selectedSiteId }` }
	interval={ 30000 }
	actionToExecute={ fetchPlugins( [ this.props.selectedSiteId ] ) }
	skipChecker={ partialRight( isRequestingForSites, [ this.props.selectedSiteId ] ) }
	/>
```