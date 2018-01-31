/** @format */
/**
 * External dependencies
 */
import { Env } from 'tinymce/tinymce';
import { noop, reduce } from 'lodash';

/**
 * Return an object containing the textarea content split into:
 * - `before` selection
 * - (`inner`) selection
 * - `after` selection
 *
 * @param {Element} textarea The editor textarea.
 * @returns {Object} The split textarea content.
 */
const splitSelectedContent = textarea => {
	const { selectionEnd, selectionStart, value } = textarea;
	return {
		before: value.substring( 0, selectionStart ),
		inner: value.substring( selectionStart, selectionEnd ),
		after: value.substring( selectionEnd, value.length ),
	};
};

/**
 * Set the cursor position after the insertion of new content into a textarea.
 *
 * @param {Element} textarea The editor textarea.
 * @param {Number} previousSelectionEnd The previous textarea.selectionEnd value
 * @param {Number} insertedContentLength The length of the inserted content.
 */
const setCursorPosition = ( textarea, previousSelectionEnd, insertedContentLength ) => {
	textarea.selectionEnd = textarea.selectionStart = previousSelectionEnd + insertedContentLength;
};

/**
 * Insert content into a textarea.
 *
 * @param {Element} textarea The target textarea.
 * @param {String} before The content before the selection.
 * @param {String} content The new content to insert.
 * @param {String} after The content after the selection.
 * @param {Function} onInsert A function to call after the insertion.
 */
export const insertContent = ( textarea, before, content, after, onInsert = noop ) => {
	const { selectionEnd, value } = textarea;
	const newContent = before + content + after;

	if ( Env.gecko ) {
		// In Firefox, execCommand( 'insertText' ), needed to preserve the undo stack,
		// always moves the cursor to the end of the content.
		// A workaround involving manually setting the cursor position and inserting the editor content
		// is needed to put the cursor back to the correct position.
		textarea.value = newContent;
		textarea.focus();
		document.execCommand( 'insertText', false, content );
		setCursorPosition( textarea, selectionEnd, newContent.length - value.length );
		textarea.focus();
	} else if ( 11 === Env.ie ) {
		// execCommand( 'insertText' ), needed to preserve the undo stack, does not exist in IE11.
		// Using the previous version of replacing the entire content value instead.
		textarea.value = newContent;
		setCursorPosition( textarea, selectionEnd, newContent.length - value.length );
	} else {
		textarea.focus();
		document.execCommand( 'insertText', false, content );
	}

	onInsert( newContent );
};

/**
 * Convert an object of attributes into a string.
 *
 * @param {Object} attributes The object of attributes.
 * @returns {String} The string of attributes.
 */
export const attributesToString = ( attributes = {} ) =>
	reduce(
		attributes,
		( attributesString, attributeValue, attributeName ) =>
			attributeValue
				? attributesString + ` ${ attributeName }="${ attributeValue }"`
				: attributesString,
		''
	);

/**
 * Creates an open tag with the given attributes and options.
 * E.g. `<div class="foo">`
 *
 * @param {Object} tag The tag to open.
 * @returns {String} The open tag.
 */
const openHtmlTag = ( { name, attributes = {}, options = {} } ) =>
	( options.paragraph ? '\n' : '' ) +
	( options.indent ? '\t' : '' ) +
	`<${ name }${ attributesToString( attributes ) }>` +
	( options.paragraph ? '\n' : '' );

/**
 * Creates a closed tag with the given options.
 * E.g. `</div>`
 *
 * @param {Object} tag The tag to close.
 * @returns {String} The closed tag.
 */
const closeHtmlTag = ( { name, options = {} } ) =>
	`</${ name }>` + ( options.newLineAfter ? '\n' : '' ) + ( options.paragraph ? '\n\n' : '' );

/**
 * Insert an open tag into the textarea.
 *
 * @param {Element} textarea The editor textarea.
 * @param {Object} tag The tag to insert.
 */
export const insertHtmlTagOpen = ( textarea, tag ) => {
	const { before, after } = splitSelectedContent( textarea );
	insertContent( textarea, before, openHtmlTag( tag ), after );
};

/**
 * Insert a closed tag into the textarea.
 *
 * @param {Element} textarea The editor textarea.
 * @param {Object} tag The tag to insert.
 */
export const insertHtmlTagClose = ( textarea, tag ) => {
	const { before, after } = splitSelectedContent( textarea );
	insertContent( textarea, before, closeHtmlTag( tag ), after );
};

/**
 * Insert, open, and close, a tag into the textarea.
 *
 * @param {Element} textarea The editor textarea.
 * @param {Object} tag The tag to insert.
 */
export const insertHtmlTagOpenClose = ( textarea, tag ) => {
	const { before, inner, after } = splitSelectedContent( textarea );
	insertContent( textarea, before, openHtmlTag( tag ) + inner + closeHtmlTag( tag ), after );
};

/**
 * Insert a self-closing tag into the textarea.
 *
 * @param {Element} textarea The editor textarea.
 * @param {Object} tag The tag to insert.
 */
export const insertHtmlTagSelfClosed = ( textarea, tag ) => {
	const { before, inner, after } = splitSelectedContent( textarea );
	const selfClosedTag = `<${ tag.name }${ attributesToString( tag.attributes ) } />`;
	const content =
		tag.options && tag.options.paragraph ? '\n' + selfClosedTag + '\n\n' : selfClosedTag;
	insertContent( textarea, before, inner + content, after );
};

/**
 * Insert a tag with text into the textarea.
 *
 * @param {Element} textarea The editor textarea.
 * @param {Object} tag The tag to insert.
 */
export const insertHtmlTagWithText = ( textarea, tag ) => {
	const { before, after } = splitSelectedContent( textarea );
	insertContent(
		textarea,
		before,
		openHtmlTag( tag ) + tag.options.text + closeHtmlTag( tag ),
		after
	);
};

/**
 * Insert some custom content into the textarea.
 *
 * @param {Element} textarea The editor textarea.
 * @param {String} content The custom content to insert.
 * @param {Object} options An options object.
 */
export const insertCustomContent = ( textarea, content, options = {} ) => {
	const { before, inner, after } = splitSelectedContent( textarea );
	const paragraph = options.paragraph ? '\n' : '';
	insertContent( textarea, before, inner + paragraph + content + paragraph + paragraph, after );
};

/**
 * Insert a tag into the textarea.
 *
 * @param {Element} textarea The editor textarea.
 * @param {Object} tag The tag to insert.
 * @param {Boolean} isTagOpen Check if the inserted tag was open.
 * @returns {Boolean} If the inserted tag is now open.
 */
export const insertHtmlTag = ( textarea, tag, isTagOpen ) => {
	const { selectionEnd, selectionStart } = textarea;
	if ( selectionEnd === selectionStart ) {
		if ( isTagOpen ) {
			insertHtmlTagClose( textarea, tag );
			return false;
		}
		insertHtmlTagOpen( textarea, tag );
		return true;
	}
	insertHtmlTagOpenClose( textarea, tag );
	return false;
};
