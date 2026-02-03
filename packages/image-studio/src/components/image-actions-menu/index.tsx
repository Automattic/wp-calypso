/**
 * Image Actions Menu Component
 *
 * Displays an ellipsis (more options) menu with actions like "Save to media library"
 * and "Revert to original" overlaid on the generated image.
 */
import { DropdownMenu } from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';
import './style.scss';

interface ImageActionsMenuProps {
	onSave?: () => void;
	onRevertToOriginal?: () => void;
}

export const ImageActionsMenu = ( { onSave, onRevertToOriginal }: ImageActionsMenuProps ) => {
	const menuControls = useMemo( () => {
		const controls = [];
		if ( onSave ) {
			controls.push( {
				title: __( 'Save to media library', 'big-sky' ),
				onClick: onSave,
			} );
		}
		if ( onRevertToOriginal ) {
			controls.push( {
				title: __( 'Revert to original', 'big-sky' ),
				onClick: onRevertToOriginal,
			} );
		}
		return controls;
	}, [ onSave, onRevertToOriginal ] );

	// Don't render if no controls
	if ( menuControls.length === 0 ) {
		return null;
	}

	return (
		<div className="image-actions-menu">
			<DropdownMenu
				className="image-actions-menu__dropdown"
				icon={ moreVertical }
				label={ __( 'More options', 'big-sky' ) }
				controls={ menuControls }
				popoverProps={ {
					className: 'image-actions-menu__dropdown-popover',
				} }
			/>
		</div>
	);
};
