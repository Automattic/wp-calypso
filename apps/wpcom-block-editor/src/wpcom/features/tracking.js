/**
 * External dependencies
 */
import { use, select } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';
import { castArray } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import tracksRecordEvent from './tracking/track-record-event';
import delegateEventTracking from './tracking/delegate-event-tracking';

// Debugger.
const debug = debugFactory( 'wpcom-block-editor:tracking' );

/**
 * Looks up the block name based on its id.
 *
 * @param {string} blockId Blog identifier.
 * @returns {string|null} Blg name if it exists. Otherwise, `null`.
 */
const getTypeForBlockId = blockId => {
	const block = select( 'core/block-editor' ).getBlock( blockId );
	return block ? block.name : null;
};

/**
 * A lot of actions accept either string (block id)
 * or an array of multiple string when operating with multiple blocks selected.
 * This is a convenience method that processes the first argument of the action (blocks)
 * and calls your tracking for each of the blocks involved in the action.
 *
 * @param {string} eventName event name
 * @returns {Function} track handler
 */
const getBlocksTracker = eventName => blockIds => {
	// track separately for each block
	castArray( blockIds ).forEach( blockId => {
		tracksRecordEvent( eventName, { block_name: getTypeForBlockId( blockId ) } );
	} );
};

/**
 * Track block insertion.
 *
 * @param {object|Array} blocks block instance object or an array of such objects
 * @returns {void}
 */
const trackBlockInsertion = blocks => {
	castArray( blocks ).forEach( block => {
		tracksRecordEvent( 'wpcom_block_inserted', {
			block_name: block.name,
			blocks_replaced: false,
		} );
	} );
};

/**
 * Track block replacement.
 *
 * @param {Array} originalBlockIds ids or blocks that are being replaced
 * @param {object|Array} blocks block instance object or an array of such objects
 * @returns {void}
 */
const trackBlockReplacement = ( originalBlockIds, blocks ) => {
	castArray( blocks ).forEach( block => {
		tracksRecordEvent( 'wpcom_block_picker_block_inserted', {
			block_name: block.name,
			blocks_replaced: true,
		} );
	} );
};

/**
 * Track update and publish action for Global Styles plugin.
 *
 * @param {string} eventName Name of the track event.
 * @returns {Function}
 */
const trackGlobalStyles = eventName => options => {
	tracksRecordEvent( eventName, {
		...options,
	} );
};

/**
 * Tracker can be
 * - string - which means it is an event name and should be tracked as such automatically
 * - function - in case you need to load additional properties from the action.
 *
 * @type {object}
 */
const REDUX_TRACKING = {
	'jetpack/global-styles': {
		resetLocalChanges: 'wpcom_global_styles_reset',
		updateOptions: trackGlobalStyles( 'wpcom_global_styles_update' ),
		publishOptions: trackGlobalStyles( 'wpcom_global_styles_publish' ),
	},
	'core/editor': {
		undo: 'wpcom_block_editor_undo_performed',
		redo: 'wpcom_block_editor_redo_performed',
	},
	'core/block-editor': {
		moveBlocksUp: getBlocksTracker( 'wpcom_block_moved_up' ),
		moveBlocksDown: getBlocksTracker( 'wpcom_block_moved_down' ),
		removeBlocks: getBlocksTracker( 'wpcom_block_deleted' ),
		removeBlock: getBlocksTracker( 'wpcom_block_deleted' ),
		moveBlockToPosition: getBlocksTracker( 'wpcom_block_moved_via_dragging' ),
		deleteBlock: getBlocksTracker( 'wpcom_block_deleted' ),
		insertBlock: trackBlockInsertion,
		insertBlocks: trackBlockInsertion,
		replaceBlock: trackBlockReplacement,
		replaceBlocks: trackBlockReplacement,
	},
};

/**
 * Mapping of Events by DOM selector.
 * Events are matched by selector and their handlers called.
 * @type {Array}
 */
const EVENT_TYPES = [ 'keyup', 'click' ];

// Registering tracking handlers.
if (
	undefined === window ||
	undefined === window._currentSiteId ||
	undefined === window._currentSiteType
) {
	debug( 'Skip: No data available.' );
} else {
	debug( 'registering tracking handlers.' );
	// Intercept dispatch function and add tracking for actions that need it.
	use( registry => ( {
		dispatch: namespace => {
			const actions = { ...registry.dispatch( namespace ) };
			const trackers = REDUX_TRACKING[ namespace ];

			if ( trackers ) {
				Object.keys( trackers ).forEach( actionName => {
					const originalAction = actions[ actionName ];
					const tracker = trackers[ actionName ];
					actions[ actionName ] = ( ...args ) => {
						debug( 'action "%s" called with %o arguments', actionName, [ ...args ] );
						if ( typeof tracker === 'string' ) {
							// Simple track - just based on the event name.
							tracksRecordEvent( tracker );
						} else if ( typeof tracker === 'function' ) {
							// Advanced tracking - call function.
							tracker( ...args );
						}
						return originalAction( ...args );
					};
				} );
			}
			return actions;
		},
	} ) );

	// Registers Plugin.
	registerPlugin( 'wpcom-block-editor-tracking', {
		render: () => {
			EVENT_TYPES.forEach( eventType =>
				document.addEventListener( eventType, delegateEventTracking )
			);
			return null;
		},
	} );
}
