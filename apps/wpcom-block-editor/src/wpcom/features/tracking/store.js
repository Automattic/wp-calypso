/* eslint-disable import/no-extraneous-dependencies */

/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { registerStore } from '@wordpress/data';

// Store identifier.
const storeName = 'automattic/tracking';

/*
 * Tracking reducer.
 */
const reducer = ( state = {}, { type, value, context = 'unknown', notFound } ) => {
	switch ( type ) {
		case 'SET_BLOCKS_SEARCH_TERM':
			return {
				...state,
				searcher: {
					[ context ]: {
						...( state.searcher ? state.searcher[ context ] : {} ),
						value,
					},
				},
			};

		case 'SET_BLOCKS_SEARCH_BLOCKS_FOUND':
			return {
				...state,
				searcher: { [ context ]: { ...state.searcher[ context ], notFound } },
			};

		case 'SET_BLOCKS_SEARCH_BLOCKS_NOT_FOUND':
			return {
				...state,
				searcher: { [ context ]: { ...state.searcher[ context ], notFound: true } },
			};
	}

	return state;
};

/*
 * Tracking Actions.
 */
const actions = {
	setSearchBlocksTerm: ( { value, context } ) => ( {
		type: 'SET_BLOCKS_SEARCH_TERM',
		value,
		context,
	} ),

	setSearchBlocks: ( { context, notFound } ) => ( {
		type: 'SET_BLOCKS_SEARCH_SEARCH_BLOCKS',
		context,
		notFound,
	} ),

	setSearchBlocksNotFound: ( { context } ) => ( {
		type: 'SET_BLOCKS_SEARCH_BLOCKS_NOT_FOUND',
		context,
	} ),
};

/*
 * Tracking selectors.
 */
const selectors = {};

registerStore( storeName, {
	reducer,
	actions,
	selectors,
} );
