/**
 * WordPress dependencies
 */
import { PostTaxonomies as PostTaxonomiesForm, PostTaxonomiesCheck } from '@wordpress/editor';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import TaxonomyPanel from './taxonomy-panel';

/**
 * Module Constants
 */
const PANEL_NAME = 'post-taxonomies';

function PostTaxonomies() {
	return (
		<PostTaxonomiesCheck>
			<PostTaxonomiesForm
				taxonomyWrapper={ ( content, taxonomy ) => {
					return (
						<TaxonomyPanel taxonomy={ taxonomy }>
							{ content }
						</TaxonomyPanel>
					);
				} }
			/>
		</PostTaxonomiesCheck>
	);
}

export default compose( [
	withSelect( ( select ) => {
		return {
			isOpened: select( 'core/edit-post' ).isEditorSidebarPanelOpened( PANEL_NAME ),
		};
	} ),
	withDispatch( ( dispatch ) => ( {
		onTogglePanel() {
			return dispatch( 'core/edit-post' ).toggleGeneralSidebarEditorPanel( PANEL_NAME );
		},
	} ) ),
] )( PostTaxonomies );

