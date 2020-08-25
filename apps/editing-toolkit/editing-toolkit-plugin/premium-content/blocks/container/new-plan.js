/**
 * WordPress dependencies
 */
import { dispatch, select } from '@wordpress/data';
import { MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * @typedef {{ onClose: () => void}} Props
 * @param {Props} props
 */
export default function NewPlan( props ) {
	return (
		<MenuGroup>
			<MenuItem
				onClick={ ( e ) => {
					e.preventDefault();
					//Open the sidebar if not open
					if ( ! select( 'core/edit-post' ).isEditorSidebarOpened() ) {
						dispatch( 'core/edit-post' ).openGeneralSidebar( 'edit-post/block' );
					}
					const input = document.getElementById( 'new-plan-name' );
					if ( input !== null ) {
						//Focus on the new plan name input
						input.focus();
					}
					props.onClose();
				} }
			>
				{ __( 'Add a new subscription', 'full-site-editing' ) }
			</MenuItem>
		</MenuGroup>
	);
}
