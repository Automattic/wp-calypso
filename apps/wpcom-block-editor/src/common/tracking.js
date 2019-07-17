/**
 * External dependencies
 */
import { isObjectLike, isUndefined, omit } from 'lodash';
import debug from 'debug';
const tracksDebug = debug( 'wpcom-block-editor:analytics:tracks' );

// In case Tracks hasn't loaded
if ( typeof window !== 'undefined' ) {
	window._tkq = window._tkq || [];
}

// Adapted from the analytics lib :(
// Because this is happening outside of the Calypso app we can't reuse the same lib
// This means we don't have any extra props like user
const tracksRecordEvent = ( eventName, eventProperties ) => {
	if ( undefined === window || undefined === window._currentSiteId ) {
		return;
	}

	// Required by Tracks when added manually
	// https://wpcom.trac.automattic.com/browser/trunk/wp-content/plugins/gutenberg-wpcom/index.php#L146
	const blogId = window._currentSiteId;

	eventProperties = eventProperties || {};

	if ( process.env.NODE_ENV !== 'production' && typeof console !== 'undefined' ) {
		for ( const key in eventProperties ) {
			if ( isObjectLike( eventProperties[ key ] ) ) {
				const errorMessage =
					`Tracks: Unable to record event "${ eventName }" because nested ` +
					`properties are not supported by Tracks. Check '${ key }' on`;
				console.error( errorMessage, eventProperties ); //eslint-disable-line no-console
				return;
			}

			if ( ! /^[a-z_][a-z0-9_]*$/.test( key ) ) {
				//eslint-disable-next-line no-console
				console.error(
					'Tracks: Event `%s` will be rejected because property name `%s` does not match /^[a-z_][a-z0-9_]*$/. ' +
						'Please use a compliant property name.',
					eventName,
					key
				);
			}
		}
	}

	// Remove properties that have an undefined value
	// This allows a caller to easily remove properties from the recorded set by setting them to undefined
	eventProperties = omit( eventProperties, isUndefined );

	eventProperties = {
		...eventProperties,
		blog_id: blogId,
	};

	tracksDebug( 'Recording event "%s" with actual props %o', eventName, eventProperties );

	// window._tkq.push( [ 'identifyUser', userId, userUsername ] );
	window._tkq.push( [ 'recordEvent', eventName, eventProperties ] );
};

// looks up the block name based on its id
const getTypeForBlockId = blockId => {
	const block = window.wp.data.select( 'core/block-editor' ).getBlock( blockId );
	return block ? block.name : null;
};

// A lot of actions accept either string (block id) or an array of multiple string
// when operating with multiple blocks selected.
// This is a convenience method that processes the first argument of the action (blocks)
// and calls your tracking for each of the blocks involved in the action.
const getBlocksTracker = eventName => blocks => {
	if ( typeof blocks === 'string' ) {
		// single block
		tracksDebug( 'TRACK:', eventName, { block_name: getTypeForBlockId( blocks ) } );
	} else {
		// multiple blocks at the same time
		const blockNames = blocks.map( getTypeForBlockId );
		// track separately for each block
		blockNames.forEach( block_name => {
			tracksDebug( 'TRACK:', eventName, { block_name } );
		} );
	}
};

// tracker can be
// - string - which means it is an event name and should be tracked as such automatically
// - function - in case you need to load additional properties from the action.
//              you are fully responsible to call the tracking
const REDUX_TRACKING = {
	'core/editor': {
		undo: 'wpcom_block_editor_undo_performed',
		redo: 'wpcom_block_editor_redo_performed',
	},
	'core/block-editor': {
		moveBlocksUp: getBlocksTracker( 'wpcom_block_moved_up' ),
		moveBlocksDown: getBlocksTracker( 'wpcom_block_moved_down' ),
		removeBlocks: getBlocksTracker( 'wpcom_block_deleted' ),
		moveBlockToPosition: getBlocksTracker( 'wpcom_block_moved_via_dragging' ),
	},
};

// intercept dispatch function and add tracking for actions that need it
window.wp.data.use( registry => ( {
	dispatch: namespace => {
		const actions = { ...registry.dispatch( namespace ) };
		const trackers = REDUX_TRACKING[ namespace ];
		if ( trackers ) {
			Object.keys( trackers ).forEach( actionName => {
				const originalAction = actions[ actionName ];
				const tracker = trackers[ actionName ];
				actions[ actionName ] = ( ...args ) => {
					// perform tracking in the next tick
					setTimeout( () => {
						tracksDebug( 'action to track', actionName, 'with arguments', [ ...args ] );
						if ( typeof tracker === 'string' ) {
							// simple trackig - just based on the event name
							tracksDebug( 'TRACK:', tracker );
						} else if ( typeof tracker === 'function' ) {
							// advanced tracking - call function
							tracker( ...args );
						}
					} );
					return originalAction( ...args );
				};
			} );
		}
		return actions;
	},
} ) );
