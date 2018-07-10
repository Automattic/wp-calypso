/**
 * External dependencies
 */
import { reduce } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

/**
 * Component which renders a div with passed props applied except the optional
 * `childHandledEvents` prop. Event prop handlers are replaced with a proxying
 * event handler to capture and prevent events from being handled by ancestor
 * `IgnoreNestedEvents` elements by testing the presence of a private property
 * assigned on the event object.
 *
 * Optionally accepts an `childHandledEvents` prop array, which can be used in
 * instances where an inner `IgnoreNestedEvents` element exists and the outer
 * element should stop propagation but not invoke a callback handler, since it
 * would be assumed these are invoked by the child element.
 *
 * @type {Component}
 */
class IgnoreNestedEvents extends Component {
	constructor() {
		super( ...arguments );

		this.proxyEvent = this.proxyEvent.bind( this );

		// The event map is responsible for tracking an event type to a React
		// component prop name, since it is easy to determine event type from
		// a React prop name, but not the other way around.
		this.eventMap = {};
	}

	/**
	 * General event handler which only calls to its original props callback if
	 * it has not already been handled by a descendant IgnoreNestedEvents.
	 *
	 * @param {Event} event Event object.
	 *
	 * @return {void}
	 */
	proxyEvent( event ) {
		const isHandled = !! event.nativeEvent._blockHandled;

		// Assign into the native event, since React will reuse their synthetic
		// event objects and this property assignment could otherwise leak.
		//
		// See: https://reactjs.org/docs/events.html#event-pooling
		event.nativeEvent._blockHandled = true;

		// Invoke original prop handler
		let propKey = this.eventMap[ event.type ];

		// If already handled (i.e. assume nested block), only invoke a
		// corresponding "Handled"-suffixed prop callback.
		if ( isHandled ) {
			propKey += 'Handled';
		}

		if ( this.props[ propKey ] ) {
			this.props[ propKey ]( event );
		}
	}

	render() {
		const { childHandledEvents = [], ...props } = this.props;

		const eventHandlers = reduce( [
			...childHandledEvents,
			...Object.keys( props ),
		], ( result, key ) => {
			// Try to match prop key as event handler
			const match = key.match( /^on([A-Z][a-zA-Z]+?)(Handled)?$/ );
			if ( match ) {
				const isHandledProp = !! match[ 2 ];
				if ( isHandledProp ) {
					// Avoid assigning through the invalid prop key. This
					// assumes mutation of shallow clone by above spread.
					delete props[ key ];
				}

				// Re-map the prop to the local proxy handler to check whether
				// the event has already been handled.
				const proxiedPropName = 'on' + match[ 1 ];
				result[ proxiedPropName ] = this.proxyEvent;

				// Assign event -> propName into an instance variable, so as to
				// avoid re-renders which could be incurred either by setState
				// or in mapping values to a newly created function.
				this.eventMap[ match[ 1 ].toLowerCase() ] = proxiedPropName;
			}

			return result;
		}, {} );

		return <div { ...props } { ...eventHandlers } />;
	}
}

export default IgnoreNestedEvents;
