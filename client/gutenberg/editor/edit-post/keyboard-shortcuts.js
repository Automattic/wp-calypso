/**
 * WordPress dependencies
 */
import { rawShortcut, displayShortcut } from '@wordpress/keycodes';

export default {
	toggleEditorMode: {
		value: rawShortcut.secondary( 'm' ),
		label: displayShortcut.secondary( 'm' ),
	},
};
