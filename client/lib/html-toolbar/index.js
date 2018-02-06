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
export const splitSelectedContent = textarea => {
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
 * @param {Number} insertedContentLength The length of the inserted content.
 */
export const setCursorPosition = ( textarea, insertedContentLength ) => {
	const { selectionEnd } = textarea;
	textarea.selectionEnd = textarea.selectionStart = selectionEnd + insertedContentLength;
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
	const { value } = textarea;
	const newContent = before + content + after;

	if ( Env.gecko ) {
		// In Firefox, execCommand( 'insertText' ), needed to preserve the undo stack,
		// always moves the cursor to the end of the content.
		// A workaround involving manually setting the cursor position and inserting the editor content
		// is needed to put the cursor back to the correct position.
		textarea.value = newContent;
		textarea.focus();
		document.execCommand( 'insertText', false, content );
		setCursorPosition( textarea, newContent.length - value.length );
		textarea.focus();
		onInsert( newContent );
	} else if ( !! Env.ie && Env.ie >= 11 ) {
		// execCommand( 'insertText' ), needed to preserve the undo stack, does not exist in IE11.
		// Using the previous version of replacing the entire content value instead.
		textarea.value = newContent;
		setCursorPosition( textarea, newContent.length - value.length );
		onInsert( newContent );
	} else {
		textarea.focus();
		document.execCommand( 'insertText', false, content );
	}
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
export const closeHtmlTag = ( { name, options = {} } ) =>
	`</${ name }>` + ( options.newLineAfter ? '\n' : '' ) + ( options.paragraph ? '\n\n' : '' );

/**
 * Insert an open tag into the textarea.
 *
 * @param {Element} textarea The editor textarea.
 * @param {Object} tag The tag to insert.
 * @param {Function} onInsert A function to call after the insertion.
 */
export const insertHtmlTagOpen = ( textarea, tag, onInsert ) => {
	const { before, after } = splitSelectedContent( textarea );
	insertContent( textarea, before, openHtmlTag( tag ), after, onInsert );
};

/**
 * Insert a closed tag into the textarea.
 *
 * @param {Element} textarea The editor textarea.
 * @param {Object} tag The tag to insert.
 * @param {Function} onInsert A function to call after the insertion.
 */
export const insertHtmlTagClose = ( textarea, tag, onInsert ) => {
	const { before, after } = splitSelectedContent( textarea );
	insertContent( textarea, before, closeHtmlTag( tag ), after, onInsert );
};

/**
 * Insert, open, and close, a tag into the textarea.
 *
 * @param {Element} textarea The editor textarea.
 * @param {Object} tag The tag to insert.
 * @param {Function} onInsert A function to call after the insertion.
 */
export const insertHtmlTagOpenClose = ( textarea, tag, onInsert ) => {
	const { before, inner, after } = splitSelectedContent( textarea );
	insertContent(
		textarea,
		before,
		openHtmlTag( tag ) + inner + closeHtmlTag( tag ),
		after,
		onInsert
	);
};

/**
 * Insert a self-closing tag into the textarea.
 *
 * @param {Element} textarea The editor textarea.
 * @param {Object} tag The tag to insert.
 * @param {Function} onInsert A function to call after the insertion.
 */
export const insertHtmlTagSelfClosed = ( textarea, tag, onInsert ) => {
	const { before, inner, after } = splitSelectedContent( textarea );
	const selfClosedTag = `<${ tag.name }${ attributesToString( tag.attributes ) } />`;
	const content =
		tag.options && tag.options.paragraph ? '\n' + selfClosedTag + '\n\n' : selfClosedTag;
	insertContent( textarea, before, inner + content, after, onInsert );
};

/**
 * Insert a tag with text into the textarea.
 *
 * @param {Element} textarea The editor textarea.
 * @param {Object} tag The tag to insert.
 * @param {Function} onInsert A function to call after the insertion.
 */
export const insertHtmlTagWithText = ( textarea, tag, onInsert ) => {
	const { before, after } = splitSelectedContent( textarea );
	insertContent(
		textarea,
		before,
		openHtmlTag( tag ) + tag.options.text + closeHtmlTag( tag ),
		after,
		onInsert
	);
};

/**
 * Insert some custom content into the textarea.
 *
 * @param {Element} textarea The editor textarea.
 * @param {String} content The custom content to insert.
 * @param {Object} options An options object.
 * @param {Function} onInsert A function to call after the insertion.
 */
export const insertCustomContent = ( textarea, content, options = {}, onInsert ) => {
	const { before, inner, after } = splitSelectedContent( textarea );
	const paragraph = options.paragraph ? '\n' : '';
	insertContent(
		textarea,
		before,
		inner + paragraph + content + paragraph + paragraph,
		after,
		onInsert
	);
};

/**
 * Insert a tag into the textarea.
 *
 * @param {Element} textarea The editor textarea.
 * @param {Object} tag The tag to insert.
 * @param {Boolean} isTagOpen Check if the inserted tag was open.
 * @param {Function} onInsert A function to call after the insertion.
 * @returns {Boolean} If the inserted tag is now open.
 */
export const insertHtmlTag = ( textarea, tag, isTagOpen, onInsert ) => {
	const { selectionEnd, selectionStart } = textarea;
	if ( selectionEnd === selectionStart ) {
		if ( isTagOpen ) {
			insertHtmlTagClose( textarea, tag, onInsert );
			return false;
		}
		insertHtmlTagOpen( textarea, tag, onInsert );
		return true;
	}
	insertHtmlTagOpenClose( textarea, tag, onInsert );
	return false;
};
