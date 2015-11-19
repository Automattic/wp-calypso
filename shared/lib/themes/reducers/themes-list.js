/**
 * External dependencies
 */
import { fromJS } from 'immutable';
import filter from 'lodash/collection/filter';
import pluck from 'lodash/collection/pluck';
import unique from 'lodash/array/unique';

/**
 * Internal dependencies
 */
import ThemesStore from '../stores/themes';
import ThemesLastQueryStore from '../stores/themes-last-query';
import ThemeConstants from '../constants';

const defaultQuery = fromJS( {
	search: '',
	perPage: ThemeConstants.PER_PAGE,
	page: 0
} );

const defaultQueryState = fromJS( {
	isLastPage: false,
	isFetchingNextPage: false
} );

export const initialState = query( fromJS( {
	list: [],
	nextId: 0,
	query: {},
	queryState: {},
	active: 0
} ) );

/**
 * Mutating helpers
 */

function add( ids, list ) {
	return unique( list.concat( ids ) );
}

function query( state, params = {} ) {
	const nextId = state.get( 'nextId' );

	return state
		.set( 'list', [] )
		.set( 'query', defaultQuery.merge( params ) )
		.setIn( [ 'query', 'id' ], nextId )
		.set( 'queryState', defaultQueryState )
		.update( 'nextId', id => id + 1 );
}

function searchJetpackThemes( state ) {
	if ( ! ThemesLastQueryStore.isJetpack() ) {
		return state;
	}

	const { search } = ThemesLastQueryStore.getParams();
	const themes = search
		? filter( ThemesStore.getThemes(), theme => matches( theme, search ) )
		: ThemesStore.getThemes();

	return state.set( 'list', pluck( themes, 'id' ) );
}

/**
 * Pure helpers
 */

function isActionForLastPage( list, action ) {
	return ! action.found ||
		list.length === action.found ||
		action.themes.length === 0;
}

function join( value ) {
	return Array.isArray( value ) ? value.join( ' ' ) : value;
}

function matches( theme, rawSearch ) {
	const search = rawSearch.toLowerCase().trim();

	return [ 'name', 'tags', 'description', 'author' ].some( field => (
		theme[ field ] && join( theme[ field ] )
			.toLowerCase().replace( '-', ' ' )
			.indexOf( search ) >= 0
	) );
}

export const reducer = ( state = initialState, payload ) => {
	const { action = payload } = payload;

	switch ( action.type ) {
		case ThemeConstants.QUERY_THEMES:
			return query( state, action.params );

		case ThemeConstants.RECEIVE_THEMES:
			if (
				( action.queryParams.id === state.getIn( [ 'query', 'id' ] ) ) ||
				ThemesLastQueryStore.isJetpack()
			) {
				const newState = state
						.setIn( [ 'queryState', 'isFetchingNextPage' ], false )
						.update( 'list', add.bind( null, pluck( action.themes, 'id' ) ) );

				return searchJetpackThemes(
					newState.setIn( [ 'queryState', 'isLastPage' ],
						isActionForLastPage( newState.get( 'list' ), action ) ) );
			}
			return state;

		case ThemeConstants.INCREMENT_THEMES_PAGE:
			return state
				.setIn( [ 'queryState', 'isFetchingNextPage' ], true )
				.updateIn( [ 'query', 'page' ], page => page + 1 )

		case ThemeConstants.RECEIVE_THEMES_SERVER_ERROR:
			return state
				.setIn( [ 'queryState', 'isFetchingNextPage' ], false )
				.setIn( [ 'queryState', 'lastPage' ], true );

		case ThemeConstants.ACTIVATED_THEME:
			// The `active` attribute isn't ever really read, but since
			// `createReducerStore()` only emits a `change` event when the new
			// state is different from the old one, we need something to change
			// here.
			return state.set( 'active', action.theme.id );

		case ThemeConstants.SEARCH_THEMES:
			return searchJetpackThemes(
				state.setIn( [ 'queryState', 'isFetchingNextPage' ], false )
			);
	}
	return state;
};

export function getThemesList( state ) {
	return state.get( 'list' );
}

export function getQueryParams( state ) {
	return state.get( 'query' ).toObject();
}

export function isFetchingNextPage( state ) {
	return state.getIn( [ 'queryState', 'isFetchingNextPage' ] );
}
