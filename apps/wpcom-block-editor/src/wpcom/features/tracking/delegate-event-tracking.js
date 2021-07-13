/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import wpcomBlockEditorCloseClick from './wpcom-block-editor-close-click';
import wpcomBlockEditorDetailsOpen from './wpcom-block-editor-details-open';
import wpcomBlockEditorGlobalStylesTabSelected from './wpcom-block-editor-global-styles-tab-selected';
import wpcomInserterInlineSearchTerm from './wpcom-inserter-inline-search-term';
import wpcomInserterTabPanelSelected from './wpcom-inserter-tab-panel-selected';
import wpcomBlockDonationsPlanUpgrade from './wpcom-block-donations-plan-upgrade';
import wpcomBlockDonationsStripeConnect from './wpcom-block-donations-stripe-connect';
import wpcomBlockPremiumContentPlanUpgrade from './wpcom-block-premium-content-plan-upgrade';
import wpcomBlockPremiumContentStripeConnect from './wpcom-block-premium-content-stripe-connect';
import {
	wpcomTemplatePartReplaceCapture,
	wpcomTemplatePartReplaceBubble,
} from './wpcom-template-part-replace';
import wpcomTemplatePartChooseExisting from './wpcom-template-part-choose-existing';
import wpcomBlockEditorListViewSelect from './wpcom-block-editor-list-view-select';
import wpcomBlockEditorTemplatePartDetachBlocks from './wpcom-block-editor-template-part-detach-blocks';

// Debugger.
const debug = debugFactory( 'wpcom-block-editor:tracking' );

const subscribers = {};
/**
 * Register a subscriber for a specific event.
 * We can specify when to call the subscriber, either 'before' or 'after'
 * the event handler is called.
 *
 * @param {string} id ID of the event
 * @param {import('./types').DelegateEventSubscriberType} type when to call the subscriber, 'before' or 'after'
 * @param {import('./types').DelegateEventSubscriberCallback} handler function to call
 */
export const registerSubscriber = ( id, type, handler ) => {
	if ( ! subscribers[ id ] ) {
		subscribers[ id ] = { before: [], after: [] };
	}
	subscribers[ id ][ type ].push( handler );
};

/**
 * Mapping of Events by DOM selector.
 * Events are matched by selector and their handlers called.
 *
 * @type {import('./types').DelegateEventHandler[]}
 */
const EVENTS_MAPPING = [
	wpcomBlockEditorCloseClick(),
	wpcomBlockEditorDetailsOpen(),
	wpcomBlockEditorGlobalStylesTabSelected(),
	wpcomInserterInlineSearchTerm(),
	wpcomInserterTabPanelSelected(),
	wpcomBlockDonationsPlanUpgrade(),
	wpcomBlockDonationsStripeConnect(),
	wpcomBlockPremiumContentPlanUpgrade(),
	wpcomBlockPremiumContentStripeConnect(),
	wpcomTemplatePartReplaceCapture(),
	wpcomTemplatePartReplaceBubble(),
	wpcomTemplatePartChooseExisting(),
	wpcomBlockEditorListViewSelect(),
	wpcomBlockEditorTemplatePartDetachBlocks(),
];
const EVENTS_MAPPING_CAPTURE = EVENTS_MAPPING.filter( ( { capture } ) => capture );
const EVENTS_MAPPING_NON_CAPTURE = EVENTS_MAPPING.filter( ( { capture } ) => ! capture );

/**
 * Checks the event for a selector which matches
 * the desired target element. Accounts for event
 * bubbling.
 *
 * @param  {object}          event          the DOM Event
 * @param  {string|Function} targetSelector the CSS selector for the target element
 * @returns {object}                        the target Element if found
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
 * @param  {boolean} capture Value of capture flag of the event listener.
 * @param  {object}  event   DOM event for the click event.
 * @returns {void}
 */
export default ( capture, event ) => {
	const eventsMappingBasedOnCapture = capture ? EVENTS_MAPPING_CAPTURE : EVENTS_MAPPING_NON_CAPTURE;
	const matchingEvents = eventsMappingBasedOnCapture.reduce( ( acc, mapping ) => {
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
		subscribers[ match.mapping.id ]?.before.forEach( ( subscriber ) =>
			subscriber( match.mapping, match.event, match.target )
		);
		match.mapping.handler( match.event, match.target );
		subscribers[ match.mapping.id ]?.after.forEach( ( subscriber ) =>
			subscriber( match.mapping, match.event, match.target )
		);
	} );
};
