/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * @see wp_mce_translation() in src/wp-includes/class-wp-editor.php from WordPress
 * In short, TinyMCE uses these strings to translate its internal strings
 */
export default {
	Formats: translate( 'Formats', { context: 'TinyMCE' } ),
	Headings: translate( 'Headings', { context: 'TinyMCE' } ),
	'Heading 1': translate( 'Heading 1' ),
	'Heading 2': translate( 'Heading 2' ),
	'Heading 3': translate( 'Heading 3' ),
	'Heading 4': translate( 'Heading 4' ),
	'Heading 5': translate( 'Heading 5' ),
	'Heading 6': translate( 'Heading 6' ),

	Blocks: translate( 'Blocks', { context: 'TinyMCE', comment: 'block tags' } ),
	Paragraph: translate( 'Paragraph' ),
	Blockquote: translate( 'Blockquote' ),
	Div: translate( 'Div', { context: 'HTML tag' } ),
	Pre: translate( 'Pre', { context: 'HTML tag' } ),
	Preformatted: translate( 'Preformatted', { context: 'HTML tag' } ),
	Address: translate( 'Address', { context: 'HTML tag' } ),

	Inline: translate( 'Inline', { context: 'HTML elements' } ),
	Underline: translate( 'Underline' ),
	Strikethrough: translate( 'Strikethrough' ),
	Subscript: translate( 'Subscript' ),
	Superscript: translate( 'Superscript' ),
	'Clear formatting': translate( 'Clear formatting' ),
	Bold: translate( 'Bold' ),
	Italic: translate( 'Italic' ),
	'Source code': translate( 'Source code' ),
	'Font Family': translate( 'Font Family' ),
	'Font Sizes': translate( 'Font Sizes' ),

	'Align center': translate( 'Align center' ),
	'Align right': translate( 'Align right' ),
	'Align left': translate( 'Align left' ),
	Justify: translate( 'Justify' ),
	'Increase indent': translate( 'Increase indent' ),
	'Decrease indent': translate( 'Decrease indent' ),

	Cut: translate( 'Cut' ),
	Copy: translate( 'Copy' ),
	Paste: translate( 'Paste' ),
	'Select all': translate( 'Select all' ),
	Undo: translate( 'Undo' ),
	Redo: translate( 'Redo' ),

	Ok: translate( 'OK' ),
	Cancel: translate( 'Cancel' ),
	Close: translate( 'Close' ),
	'Visual aids': translate( 'Visual aids' ),

	'Paste is now in plain text mode. Contents will now be pasted as plain text until you toggle this option off.':
		translate(
			'Paste is now in plain text mode. Contents will now be pasted as plain text until you toggle this option off.'
		) +
		'\n\n' +
		translate(
			'If you’re looking to paste rich content from Microsoft Word, try turning this option off. The editor will clean up text pasted from Word automatically.'
		),
	'Rich Text Area. Press ALT-F9 for menu. Press ALT-F10 for toolbar. Press ALT-0 for help': translate(
		'Rich Text Area. Press Alt-Shift-H for help'
	),
	'You have unsaved changes are you sure you want to navigate away?': translate(
		'The changes you made will be lost if you navigate away from this page.'
	),
	"Your browser doesn't support direct access to the clipboard. Please use the Ctrl+X/C/V keyboard shortcuts instead.": translate(
		'Your browser does not support direct access to the clipboard. Please use keyboard shortcuts or your browser’s edit menu instead.'
	),
	'Bullet list': translate( 'Bulleted list' ),
	'Numbered list': translate( 'Numbered list' ),

	'Toolbar Toggle': translate( 'Toolbar Toggle' ),
	'Insert Read More tag': translate( 'Insert Read More tag' ),
	'Insert Page Break tag': translate( 'Insert Page Break tag' ),
	// Tooltip for the 'alignnone' button in the image toolbar
	'No alignment': translate( 'No alignment' ),
	// Tooltip for the 'remove' button in the image toolbar
	Remove: translate( 'Remove' ),
	// Tooltip for the 'edit' button in the image toolbar
	'Edit ': translate( 'Edit' ), // eslint-disable-line
	'Horizontal line': translate( 'Horizontal line' ),
	'Text color': translate( 'Text color' ),
	'Paste as text': translate( 'Paste as text' ),
};
