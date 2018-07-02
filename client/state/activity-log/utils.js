/** @format */

/**
 * External dependencies
 */
import { toPairs, omit, isArray, isEqual } from 'lodash';

export const filterStateToApiQuery = filter =>
	Object.assign(
		{},
		filter.action && { action: filter.action },
		filter.after && { after: filter.after },
		filter.before && { before: filter.before },
		filter.by && { by: filter.by },
		filter.dateRange && { date_range: filter.dateRange },
		filter.group && { group: filter.group },
		filter.notGroup && { not_group: filter.notGroup },
		filter.name && { name: filter.name },
		{ number: 1000 }
	);

export const filterStateToQuery = filter =>
	Object.assign(
		{},
		filter.action && { action: filter.action.join( ',' ) },
		filter.after && { after: filter.after },
		filter.before && { before: filter.before },
		filter.by && { by: filter.by },
		filter.dateRange && { date_range: filter.dateRange },
		filter.group && { group: filter.group.join( ',' ) },
		filter.notGroup && { not_group: filter.notGroup.join( ',' ) },
		filter.name && { name: filter.name.join( ',' ) },
		filter.page > 1 && { page: filter.page }
	);

export const queryToFilterState = query =>
	Object.assign(
		{},
		query.action && { action: decodeURI( query.action ).split( ',' ) },
		query.after && { after: query.after },
		query.before && { before: query.before },
		query.by && { by: query.by },
		query.date_range && { dateRange: query.date_range },
		query.name && { name: decodeURI( query.name ).split( ',' ) },
		query.group && { group: decodeURI( query.group ).split( ',' ) },
		query.not_group && { notGroup: decodeURI( query.not_group ).split( ',' ) },
		query.page && query.page > 0 && { page: query.page }
	);

export const filterStateToTokens = filter => {
	const query = filterStateToApiQuery( filter ),
		tokens = [];
	toPairs( omit( query, 'number' ) ).forEach( pair => {
		isArray( pair[ 1 ] )
			? pair[ 1 ].forEach( value => {
					tokens.push( pair[ 0 ] + ':' + value );
			  } )
			: tokens.push( pair[ 0 ] + ':' + pair[ 1 ] );
	} );
	return tokens;
};

export const tokensToFilterState = tokens => {
	const query = {};
	tokens.forEach( token => {
		const pair = token.split( ':' );
		if ( pair[ 1 ] ) {
			query[ pair[ 0 ] ]
				? query[ pair[ 0 ] ].push( pair[ 1 ] )
				: ( query[ pair[ 0 ] ] = [ pair[ 1 ] ] );
		}
	} );
	return queryToFilterState( query );
};

export const logsNeedRefresh = ( query, state ) =>
	! isEqual( omit( query, 'page' ), omit( state, 'page' ) );
