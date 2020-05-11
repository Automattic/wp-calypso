/**
 * External dependencies
 */
import { debounce, get, filter, deburr, lowerCase, includes } from 'lodash';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __experimentalInserterMenuExtension as InserterMenuExtension } from '@wordpress/block-editor';
import { registerPlugin } from '@wordpress/plugins';
import { Tip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import tips from './tips';

function getTipByTerm( searchTerm, random = false ) {
	if ( ! searchTerm ) {
		return;
	}

	if ( ! tips.length ) {
		return;
	}

	const normalizedSearchTerm = deburr( lowerCase( searchTerm ) ).replace( /^\//, '' );

	const foundTips = filter(
		tips,
		( { keywords } ) =>
			filter( keywords, ( keyword ) => includes( normalizedSearchTerm, keyword ) ).length
	);

	if ( ! foundTips.length ) {
		return;
	}

	const index = random ? Math.floor( Math.random() * foundTips.length ) : 0;
	return <Tip> { get( foundTips, [ index, 'description' ] ) }</Tip>;
}

/* eslint-enable import/no-extraneous-dependencies */

const EnrichInserterMenu = function () {
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

				const tip = getTipByTerm( filterValue );

				return tip ? (
					tip
				) : (
					/* eslint-disable wpcalypso/jsx-classname-namespace */
					<p className="block-editor-inserter__no-results">{ __( 'No blocks found.' ) }</p>
				);
				/* eslint-enable wpcalypso/jsx-classname-namespace */
			} }
		</InserterMenuExtension>
	);
};

registerPlugin( 'enrich-inserter-menu', {
	render() {
		return <EnrichInserterMenu />;
	},
} );
