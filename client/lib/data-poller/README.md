# Data Poller

`Poller` is an abstraction that can be used to add polling to any data module that uses the following conventions:

- The module emits change events when data changes and expects consumers to bind to the `change` event to be notified when a change occurs
- Has a method or public function that can be called to initiate an AJAX request for new data
- Uses the EventEmitter or a derivative to emit the change event
- The data module is a single object instance that is used throughout

The module works by initiating polling when the data module has one or more objects listening for a `change` and stopping when there are no longer any `change` events bound. Polling is also paused when the visibility state of the page changes to hidden and resumed when the page is focused, unless the `pauseWhenHidden` option is set to `false`.

## Usage

### Pollers#add( store, method, [options] )

Add a new poller that fetches updates

- @param {object} `store` - instance of a data store, typically a singleton
- @param {string} `method` - method of the store that will be called to update the store
- @param {object} `[options]` - optional set of options passed to the Poller constructor
  - `interval` - time in ms between each call to the fetch method (default: 30000)
  - `leading` - whether or not fetch is called when starting the Poller when the instance is created (default: true)
    - `pauseWhenHidden` - whether or not to pause this poller when the browser tab is hidden

### Pollers#remove( poller )

- @param {int|object} `poller` - id or instance of the poller to remove

## Example

```js
import PollerPool from 'calypso/lib/data-poller';
import SitesList from 'calypso/lib/sites-list/list';

const sites = new SitesList();

// 'interval' is the time between polling requests and 'leading' is a flag that controls whether the `fetch` method
// is called when the poller is started when it is added
const poller = PollerPool.add( sites, 'fetch', { interval: 60000, leading: true } );

// remove instance from pool
PollerPool.remove( poller );
```
