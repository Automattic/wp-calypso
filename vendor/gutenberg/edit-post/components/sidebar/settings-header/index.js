/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { withDispatch, withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './style.scss';
import SidebarHeader from '../sidebar-header';

const SettingsHeader = ( { count, openDocumentSettings, openBlockSettings, sidebarName } ) => {
	// Do not display "0 Blocks".
	count = count === 0 ? 1 : count;

	return (
		<SidebarHeader
			className="edit-post-sidebar__panel-tabs"
			closeLabel={ __( 'Close settings' ) }
		>
			<button
				onClick={ openDocumentSettings }
				className={ `edit-post-sidebar__panel-tab ${ sidebarName === 'edit-post/document' ? 'is-active' : '' }` }
				aria-label={ __( 'Document settings' ) }
			>
				{ __( 'Document' ) }
			</button>
			<button
				onClick={ openBlockSettings }
				className={ `edit-post-sidebar__panel-tab ${ sidebarName === 'edit-post/block' ? 'is-active' : '' }` }
				aria-label={ __( 'Block settings' ) }
			>
				{ sprintf( _n( 'Block', '%d Blocks', count ), count ) }
			</button>
		</SidebarHeader>
	);
};

export default compose(
	withSelect( ( select ) => ( {
		count: select( 'core/editor' ).getSelectedBlockCount(),
	} ) ),
	withDispatch( ( dispatch ) => {
		const { openGeneralSidebar } = dispatch( 'core/edit-post' );
		const { clearSelectedBlock } = dispatch( 'core/editor' );
		return {
			openDocumentSettings() {
				openGeneralSidebar( 'edit-post/document' );
				clearSelectedBlock();
			},
			openBlockSettings() {
				openGeneralSidebar( 'edit-post/block' );
			},
		};
	} ),
)( SettingsHeader );
