/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { getCategories, setCategories } from '@wordpress/blocks';
import domReady from '@wordpress/dom-ready';

const categorySlugs = [ 'jetpack', 'coblocks', 'coblocks-galleries' ];

domReady( function() {
	//preserve order of other columns, and split matching
	const { core: coreCategories, custom: unsorted } = getCategories().reduce(
		( { core, custom }, category ) => {
			const matchIndex = categorySlugs.indexOf( category.slug );
			if ( matchIndex === -1 ) {
				return {
					core: [ ...core, category ],
					custom,
				};
			}
			if ( matchIndex > -1 ) {
				return {
					core,
					custom: [ ...custom, category ],
				};
			}
		},
		{ custom: [], core: [] }
	);
	//sort once following order of categorySlugs
	const customCategories = unsorted.sort( ( { slug }, { slug: slugB } ) => {
		const index = categorySlugs.indexOf( slug );
		const indexB = categorySlugs.indexOf( slugB );
		if ( index === indexB ) {
			return 0;
		}
		if ( index < indexB ) {
			return -1;
		}
		return 1;
	} );
	setCategories( [ ...coreCategories, ...customCategories ] );
} );
