/** @format */
/* eslint-disable wpcalypso/import-docblock */
/**
 * WordPress dependencies
 */
import { displayShortcutList, shortcutAriaLabel } from '@wordpress/keycodes';
import { __ } from '@wordpress/i18n';

const {
	// Cmd+<key> on a mac, Ctrl+<key> elsewhere.
	primary,
	// Shift+Cmd+<key> on a mac, Ctrl+Shift+<key> elsewhere.
	primaryShift,
	// Option+Cmd+<key> on a mac, Ctrl+Alt+<key> elsewhere.
	primaryAlt,
	// Shift+Alt+Cmd+<key> on a mac, Ctrl+Shift+Akt+<key> elsewhere.
	secondary,
	// Ctrl+Alt+<key> on a mac, Shift+Alt+<key> elsewhere.
	access,
	ctrl,
	alt,
	ctrlShift,
	shiftAlt,
} = displayShortcutList;

const globalShortcuts = {
	title: __( 'Global shortcuts' ),
	shortcuts: [
		{
			keyCombination: access( 'h' ),
			description: __( 'Display this help.' ),
		},
		{
			keyCombination: primary( 's' ),
			description: __( 'Save your changes.' ),
		},
		{
			keyCombination: primary( 'z' ),
			description: __( 'Undo your last changes.' ),
		},
		{
			keyCombination: primaryShift( 'z' ),
			description: __( 'Redo your last undo.' ),
		},
		{
			keyCombination: primaryShift( ',' ),
			description: __( 'Show or hide the settings sidebar.' ),
			ariaLabel: shortcutAriaLabel.primaryShift( ',' ),
		},
		{
			keyCombination: access( 'o' ),
			description: __( 'Open the block navigation menu.' ),
		},
		{
			keyCombination: ctrl( '`' ),
			description: __( 'Navigate to the next part of the editor.' ),
			ariaLabel: shortcutAriaLabel.ctrl( '`' ),
		},
		{
			keyCombination: ctrlShift( '`' ),
			description: __( 'Navigate to the previous part of the editor.' ),
			ariaLabel: shortcutAriaLabel.ctrlShift( '`' ),
		},
		{
			keyCombination: shiftAlt( 'n' ),
			description: __( 'Navigate to the next part of the editor (alternative).' ),
		},
		{
			keyCombination: shiftAlt( 'p' ),
			description: __( 'Navigate to the previous part of the editor (alternative).' ),
		},
		{
			keyCombination: alt( 'F10' ),
			description: __( 'Navigate to the nearest toolbar.' ),
		},
		{
			keyCombination: secondary( 'm' ),
			description: __( 'Switch between Visual Editor and Code Editor.' ),
		},
	],
};

const selectionShortcuts = {
	title: __( 'Selection shortcuts' ),
	shortcuts: [
		{
			keyCombination: primary( 'a' ),
			description: __( 'Select all text when typing. Press again to select all blocks.' ),
		},
		{
			keyCombination: 'Esc',
			description: __( 'Clear selection.' ),
			/* translators: The 'escape' key on a keyboard. */
			ariaLabel: __( 'Escape' ),
		},
	],
};

const blockShortcuts = {
	title: __( 'Block shortcuts' ),
	shortcuts: [
		{
			keyCombination: primaryShift( 'd' ),
			description: __( 'Duplicate the selected block(s).' ),
		},
		{
			keyCombination: access( 'z' ),
			description: __( 'Remove the selected block(s).' ),
		},
		{
			keyCombination: primaryAlt( 't' ),
			description: __( 'Insert a new block before the selected block(s).' ),
		},
		{
			keyCombination: primaryAlt( 'y' ),
			description: __( 'Insert a new block after the selected block(s).' ),
		},
		{
			keyCombination: '/',
			description: __( 'Change the block type after adding a new paragraph.' ),
			/* translators: The forward-slash character. e.g. '/'. */
			ariaLabel: __( 'Forward-slash' ),
		},
	],
};

const textFormattingShortcuts = {
	title: __( 'Text formatting' ),
	shortcuts: [
		{
			keyCombination: primary( 'b' ),
			description: __( 'Make the selected text bold.' ),
		},
		{
			keyCombination: primary( 'i' ),
			description: __( 'Make the selected text italic.' ),
		},
		{
			keyCombination: primary( 'u' ),
			description: __( 'Underline the selected text.' ),
		},
		{
			keyCombination: primary( 'k' ),
			description: __( 'Convert the selected text into a link.' ),
		},
		{
			keyCombination: primaryShift( 'k' ),
			description: __( 'Remove a link.' ),
		},
		{
			keyCombination: access( 'd' ),
			description: __( 'Add a strikethrough to the selected text.' ),
		},
		{
			keyCombination: access( 'x' ),
			description: __( 'Display the selected text in a monospaced font.' ),
		},
	],
};

export default [ globalShortcuts, selectionShortcuts, blockShortcuts, textFormattingShortcuts ];
