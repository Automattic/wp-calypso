# Delayed dispatch

Sometimes we need to delay the dispatch of an action.
If all we do is directly set a timeout inside some middleware then it becomes very difficult to test because the tests become asynchronous.
If we had a way of describing that we want to dispatch some action after a given waiting period then we could instead test that description instead of actually scheduling it for the future.
This middleware accomplishes that goal exactly.

## How to use?

Simply wrap your action in the delayed action creator and supply a delay.
Note that you can optionally provide an explanation for the delay (for logging/debugging purposes).

```js
import { delayDispatch } from 'state/delayed-dispatch/actions';

const Delayer = ( { spinSprocket } ) => <button onClick={ spinSprocket } />

const mapDispatchToProps = {
	spinSprocket: delayDispatch( 5000, { type: SPIN_SPROCKET }, 'Waiting for battery to charge' )
}

export default connect( null, mapDispatchToProps )( Delayer )
```

However, we are more likely to use this from within other middleware.

```js
import { delayDispatch } from 'state/delayed-dispatch/actions';

const middleware = store => next => action => {
	if ( SPIN_SPROCKET !== action.type ) {
		return next( action );
	}
	
	return delayDispatch( random( 1000, 3000 ), action );
}
```
