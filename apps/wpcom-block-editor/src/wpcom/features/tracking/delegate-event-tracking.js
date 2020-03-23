/**
 * External dependencies
 */
import debugFactory from 'debug';
/**
 * Internal dependencies
 */
import wpcomBlockPickerSearchTerm from './wpcom-block-picker-search-term-handler';
import wpcomBlockEditorCloseClick from './wpcom-block-editor-close-click';

// Debugger.
const debug = debugFactory( 'wpcom-block-editor:tracking' );

/**
 * Mapping of Events by DOM selector.
 * Events are matched by selector and their handlers called.
 *
 * @type {Array}
 */
const EVENTS_MAPPING = [ wpcomBlockEditorCloseClick(), wpcomBlockPickerSearchTerm() ];

/**
 * Checks the event for a selector which matches
 * the desired target element. Accounts for event
 * bubbling.
 *
 * @param  {DOMEvent} event          the DOM event
 * @param  {string} targetSelector the CSS selector for the target element
 * @returns {Node}                the target element if found
 */
const getMatchingEventTarget = ( event, targetSelector ) => {
	return event.target.matches( targetSelector )
		? event.target
		: event.target.closest( targetSelector );
};

/**
 * Handles delegation of click tracking events.
 * Matches an event against list of known events
 * and for each match fires an appropriate handler function.
 *
 * @param  {object} event DOM event for the click event.
 * @returns {void}
 */
export default event => {
	const matchingEvents = EVENTS_MAPPING.reduce( ( acc, mapping ) => {
		const target = getMatchingEventTarget( event, mapping.selector );

		// Set `click` as default of mapping event type.
		const mappingEventType = mapping.type || 'click';

		if ( target && event.type && event.type === mappingEventType ) {
			acc.push( { mapping, event, target } );
		}
		return acc;
	}, [] );

	if ( ! matchingEvents.length ) {
		return;
	}

	matchingEvents.forEach( match => {
		debug( 'triggering "%s". target: "%s"', match.event, match.target );
		match.mapping.handler( match.event, match.target );
	} );
};
