/* eslint-disable import/no-extraneous-dependencies */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { registerStore } from '@wordpress/data';

// Store identifier.
export const AutomatticTrackingStoreName = 'automattic/tracking';

/*
 * Tracking reducer.
 */
const reducer = (
	state = {},
	{ type, value, context = 'unknown', notFound, slug, blocks, section, subsection }
) => {
	switch ( type ) {
		case 'SET_BLOCKS_SEARCH_TERM':
			return {
				...state,
				searcher: {
					...state.searcher,
					[ context ]: {
						...( state.searcher ? state.searcher[ context ] : {} ),
						value,
					},
				},
			};

		case 'SET_BLOCKS_SEARCH_BLOCKS_FOUND':
			return {
				...state,
				searcher: {
					...state.searcher,
					[ context ]: { ...state.searcher[ context ], notFound },
				},
			};

		case 'SET_BLOCKS_SEARCH_BLOCKS_NOT_FOUND':
			return {
				...state,
				searcher: {
					...state.searcher,
					[ context ]: { ...state.searcher[ context ], notFound: true },
				},
			};

		case 'SET_TIP_CLICK_ON':
			return {
				...state,
				tip: {
					...state.tip,
					[ context ]: {
						...( state.tip ? state.tip[ context ] : {} ),
						section,
						subsection,
					},
				},
			};

		case 'SET_TEMPLATES_WITH_MISSING_BLOCKS':
			return {
				...state,
				brokenTemplates: {
					...state.brokenTemplates,
					[ slug ]: {
						slug,
						context,
						blocks,
						cause: 'missing_blocks',
					},
				},
			};

		default:
			return state;
	}
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

	clickOnContextualTip: ( { context, section, subsection } ) => ( {
		type: 'SET_TIP_CLICK_ON',
		context,
		section,
		subsection,
	} ),

	/**
	 * Return an function that triggers an action when
	 * a template has broken blocks.
	 *
	 * @param {object} prop         Action properties.
	 * @param {string} prop.slug    Template name.
	 * @param {string} prop.context Context where the action is triggered.
	 * @param {Array}  prop.blocks  Broken blocks array.
	 * @returns {{blocks: *, name: *, context: *, type: string}} Action handler.
	 */
	emitTemplatesWithMissingBlocks: ( { slug, context, blocks } ) => ( {
		type: 'SET_TEMPLATES_WITH_MISSING_BLOCKS',
		slug,
		context,
		blocks,
	} ),
};

/*
 * Tracking selectors.
 */
const selectors = {
	getSearchTerm: ( state, context ) => get( state, [ 'searcher', context, 'value' ] ),
	getContextualTip: ( state, context ) => get( state, [ 'tip', context ] ),
};

registerStore( AutomatticTrackingStoreName, {
	reducer,
	actions,
	selectors,
} );
