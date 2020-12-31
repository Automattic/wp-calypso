/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { MenuGroup } from '@wordpress/components';
import { __, _x } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import FeatureToggle from '../toggle-feature';
import OptionToggle from '../toggle-option';

/** @typedef {import('../../../index').BlockEditorSettings} BlockEditorSettings */
/** @typedef {import('./index').OnClose} OnClose */

/**
 * Writing menu
 *
 * @param {object} props - Component props
 * @param {OnClose} props.onClose - Close the menu
 * @param {BlockEditorSettings} props.settings - Settings
 */
function WritingMenu( { onClose, settings } ) {
	const { preview, fullscreen, topToolbar } = settings.iso.moreMenu;
	const { isFullscreen } = useSelect(
		( select ) => ( {
			isFullscreen: select( 'isolated/editor' ).isOptionActive( 'fullscreenMode' ),
		} ),
		[]
	);

	// Anything to show?
	if ( ! fullscreen && ! preview && ! topToolbar ) {
		return null;
	}

	return (
		<MenuGroup label={ _x( 'View', 'noun' ) }>
			{ topToolbar && (
				<>
					<FeatureToggle
						feature="fixedToolbar"
						label={ __( 'Top toolbar' ) }
						info={ __( 'Access all block and document tools in a single place.' ) }
						messageActivated={ __( 'Top toolbar activated' ) }
						messageDeactivated={ __( 'Top toolbar deactivated' ) }
						onClose={ onClose }
					/>
				</>
			) }
			{ fullscreen && (
				<OptionToggle
					option="fullscreenMode"
					label={ __( 'Fullscreen' ) }
					info={ __( 'Show editor fullscreen.' ) }
					onClose={ onClose }
				/>
			) }
			{ preview && ! isFullscreen && (
				<OptionToggle
					option="preview"
					label={ __( 'Preview' ) }
					info={ __( 'Preview the content before posting.' ) }
					onClose={ onClose }
				/>
			) }
		</MenuGroup>
	);
}

export default WritingMenu;
