/**
 * External dependencies
 */
import { get, filter, deburr, lowerCase, includes, uniq } from 'lodash';

/**
 * WordPress dependencies
 */
import { Tip } from '@wordpress/components';

/**
 * Internal dependencies
 */
import tipsList from './list';

export default function ( { searchTerm, random = false } ) {
	if ( ! searchTerm ) {
		return null;
	}

	if ( ! tipsList.length ) {
		return null;
	}

	const normalizedSearchTerm = deburr( lowerCase( searchTerm ) ).replace( /^\//, '' );

	const foundTips = filter(
		tipsList,
		( { keywords, permission } ) =>
			permission() &&
			filter( uniq( keywords ), ( keyword ) => includes( normalizedSearchTerm, keyword ) ).length
	);

	if ( ! foundTips.length ) {
		return null;
	}

	const index = random ? Math.floor( Math.random() * foundTips.length ) : 0;

	return (
		<div className="contextual-tip">
			<Tip>{ get( foundTips, [ index, 'description' ] ) }</Tip>
		</div>
	);
}
