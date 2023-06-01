# Persistent Counter

This is a basic counter that can be used to count any sort of Calypso event or action persistently using [Calypso Preferences](https://github.com/Automattic/wp-calypso/tree/trunk/client/state/preferences). (Preferences are saved to `me/settings` and available in Redux state).

## Usage

To create the counter and increment:

```
import { useDispatch } from 'calypso/state';
import { incrementCounter } from 'calypso/state/persistent-counter/actions';
const dispatch = useDispatch();

const MY_COUNTER_NAME = 'my-counter-name';

dispatch( incrementCounter( MY_COUNTER_NAME ) );
```

### More info

`incrementCounter`, `decrementCounter`, and `resetCounter` are redux actions that can be dispatched. Thier argument signature is as follows:

`incrementCounter( counterName, keyedToSiteId = false, countSameDay = true );`

`counterName` - a unique slug/name that will be used to reference the counter.
`keyedToSiteId` - if true, the counter will be keyed to the currently selected siteId and therefore a counter will be created and incremented/decremented per each currently selected siteId.
`countSameDay` - if false, the counter will only increment, at most, once per day.

#### The counter keyed by siteId

`dispatch( incrementCounter( MY_COUNTER_NAME, true ) );`

#### The counter will only increment at most, once per day (ie- not allow incrementing on the same day)

`dispatch( incrementCounter( MY_COUNTER_NAME, false, false ) );`

##### getCount

To retrieve a counter's current count, call the `getCount()` selector:

```
import { useSelector } from 'calypso/state';

const currentCount = useSelector( state => getCount( MY_COUNTER_NAME, false ) );
```

##### Other selectors

`counterExists( state, counterName, keyedToSiteId )`

`getCounter( state, counterName, keyedToSiteId )`
