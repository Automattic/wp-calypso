/** @format */
/* eslint-disable wpcalypso/import-docblock */
/**
 * WordPress dependencies
 */
import { rawShortcut, displayShortcut, shortcutAriaLabel } from '@wordpress/keycodes';

export default {
	toggleEditorMode: {
		raw: rawShortcut.secondary( 'm' ),
		display: displayShortcut.secondary( 'm' ),
	},
	toggleSidebar: {
		raw: rawShortcut.primaryShift( ',' ),
		display: displayShortcut.primaryShift( ',' ),
		ariaLabel: shortcutAriaLabel.primaryShift( ',' ),
	},
};
