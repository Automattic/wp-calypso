/**
 * External dependencies
 */
import { debounce, get, filter, deburr, lowerCase, includes, uniq } from 'lodash';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __experimentalInserterMenuExtension as InserterMenuExtension } from '@wordpress/block-editor';
import { registerPlugin } from '@wordpress/plugins';
import { Tip } from '@wordpress/components';

import './index.scss';

/**
 * Internal dependencies
 */
import tips from './tips';

function ContextualTip( { searchTerm, random = false } ) {
	if ( ! searchTerm ) {
		return null;
	}

	if ( ! tips.length ) {
		return null;
	}

	const normalizedSearchTerm = deburr( lowerCase( searchTerm ) ).replace( /^\//, '' );

	const foundTips = filter(
		tips,
		( { keywords, permission } ) =>
			permission() &&
			filter( uniq( keywords ), ( keyword ) => includes( normalizedSearchTerm, keyword ) ).length
	);

	if ( ! foundTips.length ) {
		return null;
	}

	const index = random ? Math.floor( Math.random() * foundTips.length ) : 0;
	return <Tip> { get( foundTips, [ index, 'description' ] ) }</Tip>;
}

const ContextualTips = function () {
	const [ debouncedFilterValue, setFilterValue ] = useState( '' );

	const debouncedSetFilterValue = debounce( setFilterValue, 400 );

	return (
		<InserterMenuExtension>
			{ ( { filterValue, hasItems } ) => {
				if ( hasItems || ! filterValue ) {
					return null;
				}

				if ( debouncedFilterValue !== filterValue ) {
					debouncedSetFilterValue( filterValue );
				}

				return <ContextualTip searchTerm={ filterValue } />;
			} }
		</InserterMenuExtension>
	);
};

// Check if the experimental slot is available before to register plugin.
if ( typeof InserterMenuExtension !== 'undefined' ) {
	registerPlugin( 'insert-menu-contextual-tips', {
		render() {
			return <ContextualTips />;
		},
	} );
}
