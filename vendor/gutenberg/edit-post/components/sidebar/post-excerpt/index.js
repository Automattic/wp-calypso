/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { PostExcerpt as PostExcerptForm, PostExcerptCheck } from '@wordpress/editor';
import { compose } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Module Constants
 */
const PANEL_NAME = 'post-excerpt';

function PostExcerpt( { isOpened, onTogglePanel } ) {
	return (
		<PostExcerptCheck>
			<PanelBody title={ __( 'Excerpt' ) } opened={ isOpened } onToggle={ onTogglePanel }>
				<PostExcerptForm />
			</PanelBody>
		</PostExcerptCheck>
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
] )( PostExcerpt );

