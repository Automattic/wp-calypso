/** @format */
/**
 * WordPress dependencies
 */
import { compose, ifCondition } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import BaseOption from './base';

export default compose(
	withSelect( ( select, { panelName } ) => {
		const { isEditorPanelEnabled, isEditorPanelRemoved } = select( 'core/edit-post' );
		return {
			isRemoved: isEditorPanelRemoved( panelName ),
			isChecked: isEditorPanelEnabled( panelName ),
		};
	} ),
	ifCondition( ( { isRemoved } ) => ! isRemoved ),
	withDispatch( ( dispatch, { panelName } ) => ( {
		onChange: () => dispatch( 'core/edit-post' ).toggleEditorPanelEnabled( panelName ),
	} ) )
)( BaseOption );
