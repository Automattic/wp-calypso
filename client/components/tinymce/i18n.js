/**
 * External dependencies
 */
const i18n = require( 'i18n-calypso' );

/**
 * @see wp_mce_translation() in src/wp-includes/class-wp-editor.php from WordPress
 */
module.exports = {

	Formats: i18n.translate( 'Formats', { context: 'TinyMCE' } ),
	Headings: i18n.translate( 'Headings', { context: 'TinyMCE' } ),
	'Heading 1': i18n.translate( 'Heading 1' ),
	'Heading 2': i18n.translate( 'Heading 2' ),
	'Heading 3': i18n.translate( 'Heading 3' ),
	'Heading 4': i18n.translate( 'Heading 4' ),
	'Heading 5': i18n.translate( 'Heading 5' ),
	'Heading 6': i18n.translate( 'Heading 6' ),

	Blocks: i18n.translate( 'Blocks', { context: 'TinyMCE', comment: 'block tags' } ),
	Paragraph: i18n.translate( 'Paragraph' ),
	Blockquote: i18n.translate( 'Blockquote' ),
	Div: i18n.translate( 'Div', { context: 'HTML tag' } ),
	Pre: i18n.translate( 'Pre', { context: 'HTML tag' } ),
	Preformatted: i18n.translate( 'Preformatted', { context: 'HTML tag' } ),
	Address: i18n.translate( 'Address', { context: 'HTML tag' } ),

	Inline: i18n.translate( 'Inline', { context: 'HTML elements' } ),
	Underline: i18n.translate( 'Underline' ),
	Strikethrough: i18n.translate( 'Strikethrough' ),
	Subscript: i18n.translate( 'Subscript' ),
	Superscript: i18n.translate( 'Superscript' ),
	'Clear formatting': i18n.translate( 'Clear formatting' ),
	Bold: i18n.translate( 'Bold' ),
	Italic: i18n.translate( 'Italic' ),
	'Source code': i18n.translate( 'Source code' ),
	'Font Family': i18n.translate( 'Font Family' ),
	'Font Sizes': i18n.translate( 'Font Sizes' ),

	'Align center': i18n.translate( 'Align center' ),
	'Align right': i18n.translate( 'Align right' ),
	'Align left': i18n.translate( 'Align left' ),
	Justify: i18n.translate( 'Justify' ),
	'Increase indent': i18n.translate( 'Increase indent' ),
	'Decrease indent': i18n.translate( 'Decrease indent' ),

	Cut: i18n.translate( 'Cut' ),
	Copy: i18n.translate( 'Copy' ),
	Paste: i18n.translate( 'Paste' ),
	'Select all': i18n.translate( 'Select all' ),
	Undo: i18n.translate( 'Undo' ),
	Redo: i18n.translate( 'Redo' ),

	Ok: i18n.translate( 'OK' ),
	Cancel: i18n.translate( 'Cancel' ),
	Close: i18n.translate( 'Close' ),
	'Visual aids': i18n.translate( 'Visual aids' ),

	'Paste is now in plain text mode. Contents will now be pasted as plain text until you toggle this option off.': i18n.translate( 'Paste is now in plain text mode. Contents will now be pasted as plain text until you toggle this option off.' ) + '\n\n' + i18n.translate( 'If you’re looking to paste rich content from Microsoft Word, try turning this option off. The editor will clean up text pasted from Word automatically.' ),
	'Rich Text Area. Press ALT-F9 for menu. Press ALT-F10 for toolbar. Press ALT-0 for help': i18n.translate( 'Rich Text Area. Press Alt-Shift-H for help' ),
	'You have unsaved changes are you sure you want to navigate away?': i18n.translate( 'The changes you made will be lost if you navigate away from this page.' ),
	'Your browser doesn\'t support direct access to the clipboard. Please use the Ctrl+X/C/V keyboard shortcuts instead.': i18n.translate( 'Your browser does not support direct access to the clipboard. Please use keyboard shortcuts or your browser’s edit menu instead.' ),
	'Bullet list': i18n.translate( 'Bulleted list' ),
	'Numbered list': i18n.translate( 'Numbered list' ),

	'Toolbar Toggle': i18n.translate( 'Toolbar Toggle' ),
	'Insert Read More tag': i18n.translate( 'Insert Read More tag' ),
	'Insert Page Break tag': i18n.translate( 'Insert Page Break tag' ),
	// Title on the placeholder inside the editor
	'Read more...': i18n.translate( 'Read more...' ),
	// Tooltip for the 'alignnone' button in the image toolbar
	'No alignment': i18n.translate( 'No alignment' ),
	// Tooltip for the 'remove' button in the image toolbar
	Remove: i18n.translate( 'Remove' ),
	// Tooltip for the 'edit' button in the image toolbar
	'Edit ': i18n.translate( 'Edit' ) // eslint-disable-line

};
