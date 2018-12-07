/** @format */
/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { ifViewportMatches } from '@wordpress/viewport';

/**
 * Internal dependencies
 */
import BaseOption from './base';

export default compose(
	withSelect( select => ( {
		isChecked: select( 'core/editor' ).isPublishSidebarEnabled(),
	} ) ),
	withDispatch( dispatch => {
		const { enablePublishSidebar, disablePublishSidebar } = dispatch( 'core/editor' );
		return {
			onChange: isEnabled => ( isEnabled ? enablePublishSidebar() : disablePublishSidebar() ),
		};
	} ),
	// In < medium viewports we override this option and always show the publish sidebar.
	// See the edit-post's header component for the specific logic.
	ifViewportMatches( 'medium' )
)( BaseOption );
