/**
 * External Dependencies
 */
import { some, includes } from 'lodash';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

export function PostTaxonomiesCheck( { postType, taxonomies, children } ) {
	const hasTaxonomies = some( taxonomies, ( taxonomy ) => includes( taxonomy.types, postType ) );
	if ( ! hasTaxonomies ) {
		return null;
	}

	return children;
}

export default compose( [
	withSelect( ( select ) => {
		return {
			postType: select( 'core/editor' ).getCurrentPostType(),
			taxonomies: select( 'core' ).getTaxonomies(),
		};
	} ),
] )( PostTaxonomiesCheck );

