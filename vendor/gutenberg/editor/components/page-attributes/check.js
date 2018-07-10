/**
 * External dependencies
 */
import { get, isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';

export function PageAttributesCheck( { availableTemplates, postType, children } ) {
	const supportsPageAttributes = get( postType, [ 'supports', 'page-attributes' ], false );

	// Only render fields if post type supports page attributes or available templates exist.
	if ( ! supportsPageAttributes && isEmpty( availableTemplates ) ) {
		return null;
	}

	return children;
}

export default withSelect( ( select ) => {
	const { getEditedPostAttribute, getEditorSettings } = select( 'core/editor' );
	const { getPostType } = select( 'core' );
	const { availableTemplates } = getEditorSettings();
	return {
		postType: getPostType( getEditedPostAttribute( 'type' ) ),
		availableTemplates,
	};
} )( PageAttributesCheck );
