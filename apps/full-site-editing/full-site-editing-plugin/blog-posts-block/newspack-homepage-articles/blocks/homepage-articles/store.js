import { registerStore, select, subscribe, dispatch } from '@wordpress/data';
import { uniq } from 'lodash';

import metadata from './block.json';

const { name } = metadata;
export const STORE_NAMESPACE = name;
const blockName = `newspack-blocks/${ name }`;

const initialState = {
	queryBlocks: [], // list of Query blocks in the order they are on the page
	postsByBlock: {}, // map of returned posts to block clientId
	specificPostsByBlock: {}, // posts displayed by specific-mode, which always return in the selector
};

const UPDATE_BLOCKS = 'UPDATE_BLOCKS';
const MARK_POSTS_DISPLAYED = 'MARK_POSTS_DISPLAYED';
const MARK_SPECIFIC_POSTS_DISPLAYED = 'MARK_SPECIFIC_POSTS_DISPLAYED';

const actions = {
	updateBlocks( blocks ) {
		return {
			type: UPDATE_BLOCKS,
			blocks,
		};
	},
	markPostsAsDisplayed( clientId, posts ) {
		return {
			type: MARK_POSTS_DISPLAYED,
			clientId,
			posts,
		};
	},
	markSpecificPostsAsDisplayed( clientId, posts ) {
		return {
			type: MARK_SPECIFIC_POSTS_DISPLAYED,
			clientId,
			posts,
		};
	},
};

/**
 * @typedef Block A Gutenberg editor block
 * @type {Object}
 * @typedef uuid Unique id
 * @type {string}
 */

/**
 * Returns the Query blocks that appear before the current one on the page
 *
 * @param {Block[]} orderedBlocks Ordered Blocks
 * @param {uuid} clientId client id
 * @return {Block[]} blocks
 */
const blocksBefore = ( orderedBlocks, clientId ) => {
	const ourBlockIdx = orderedBlocks.findIndex( b => b.clientId === clientId );
	return orderedBlocks.slice( 0, ourBlockIdx );
};

const selectors = {
	previousPostIds( state, _clientId ) {
		const { queryBlocks, specificPostsByBlock, postsByBlock } = state;

		const postIdsFromSpecificMode = queryBlocks
			.filter( ( { clientId } ) => specificPostsByBlock[ clientId ] )
			.flatMap( ( { clientId } ) => specificPostsByBlock[ clientId ].map( p => p.id ) );

		const previousPostIds = blocksBefore( queryBlocks, _clientId )
			.filter( ( { clientId } ) => postsByBlock[ clientId ] )
			.flatMap( ( { clientId } ) => postsByBlock[ clientId ].map( p => p.id ) );

		return uniq( postIdsFromSpecificMode.concat( previousPostIds ) ).sort();
	},
};

/**
 * Returns an array of all newspack-blocks/query blocks in the order they are on
 * the page. This is needed to be able to show the editor blocks in the order
 * that PHP will render them.
 *
 * @param {Block[]} blocks any blocks
 * @return {Block[]} ordered newspack-blocks/query blocks
 */
const getQueryBlocksInOrder = blocks =>
	blocks.flatMap( block => {
		const queryBlocks = [];
		if ( block.name === blockName ) {
			queryBlocks.push( block );
		}
		return queryBlocks.concat( getQueryBlocksInOrder( block.innerBlocks ) );
	} );

const reducer = ( state = initialState, action ) => {
	switch ( action.type ) {
		case UPDATE_BLOCKS:
			const updateBlocksState = {
				...state,
				queryBlocks: getQueryBlocksInOrder( action.blocks ),
			};
			return updateBlocksState;
		case MARK_POSTS_DISPLAYED:
			return {
				...state,
				postsByBlock: {
					...state.postsByBlock,
					[ action.clientId ]: action.posts,
				},
			};
		case MARK_SPECIFIC_POSTS_DISPLAYED:
			return {
				...state,
				specificPostsByBlock: {
					...state.specificPostsByBlock,
					[ action.clientId ]: action.posts,
				},
			};
	}
	return state;
};

export const registerQueryStore = () => {
	registerStore( STORE_NAMESPACE, {
		reducer,
		actions,
		selectors,
		initialState,
	} );

	const { getClientIdsWithDescendants, getBlocks } = select( 'core/block-editor' );
	const { updateBlocks } = dispatch( STORE_NAMESPACE );

	let currentBlocksIds;
	subscribe( () => {
		const newBlocksIds = getClientIdsWithDescendants();
		// I don't know why != works but it does, I guess getClientIdsWithDescendants is memoized?
		const blocksChanged = newBlocksIds !== currentBlocksIds;
		currentBlocksIds = newBlocksIds;

		if ( blocksChanged ) {
			updateBlocks( getBlocks() );
		}
	} );
};
