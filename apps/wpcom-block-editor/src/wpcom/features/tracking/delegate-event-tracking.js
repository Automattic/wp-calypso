/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import wpcomBlockEditorCloseClick from './wpcom-block-editor-close-click';
import wpcomInserterInlineSearchTerm from './wpcom-inserter-inline-search-term';
import wpcomInserterTabPanelSelected from './wpcom-inserter-tab-panel-selected';
import wpcomBlockDonationsPlanUpgrade from './wpcom-block-donations-plan-upgrade';
import wpcomBlockDonationsStripeConnect from './wpcom-block-donations-stripe-connect';
import wpcomBlockPremiumContentPlanUpgrade from './wpcom-block-premium-content-plan-upgrade';
import wpcomBlockPremiumContentStripeConnect from './wpcom-block-premium-content-stripe-connect';

// Debugger.
const debug = debugFactory( 'wpcom-block-editor:tracking' );

/**
 * Mapping of Events by DOM selector.
 * Events are matched by selector and their handlers called.
 *
 * @type {Array}
 */
const EVENTS_MAPPING = [
	wpcomBlockEditorCloseClick(),
	wpcomInserterInlineSearchTerm(),
	wpcomInserterTabPanelSelected(),
	wpcomBlockDonationsPlanUpgrade(),
	wpcomBlockDonationsStripeConnect(),
	wpcomBlockPremiumContentPlanUpgrade(),
	wpcomBlockPremiumContentStripeConnect(),
];

/**
 * Checks the event for a selector which matches
 * the desired target element. Accounts for event
 * bubbling.
 *
 * @param  {object} event          the DOM Event
 * @param  {string|Function} targetSelector the CSS selector for the target element
 * @returns {object}                the target Element if found
 */
const getMatchingEventTarget = ( event, targetSelector ) => {
	if ( typeof targetSelector === 'function' ) {
		return targetSelector( event );
	}

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
export default ( event ) => {
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

	matchingEvents.forEach( ( match ) => {
		debug( 'triggering "%s". target: "%s"', match.event, match.target );
		match.mapping.handler( match.event, match.target );
	} );
};
