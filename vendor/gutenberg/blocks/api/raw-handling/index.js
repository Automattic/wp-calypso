/**
 * External dependencies
 */
import { flatMap, filter, compact } from 'lodash';
// Also polyfills Element#matches.
import 'element-closest';

/**
 * Internal dependencies
 */
import { createBlock, getBlockTransforms, findTransform } from '../factory';
import { getBlockType } from '../registration';
import { getBlockAttributes, parseWithGrammar } from '../parser';
import normaliseBlocks from './normalise-blocks';
import specialCommentConverter from './special-comment-converter';
import isInlineContent from './is-inline-content';
import phrasingContentReducer from './phrasing-content-reducer';
import msListConverter from './ms-list-converter';
import listReducer from './list-reducer';
import imageCorrector from './image-corrector';
import blockquoteNormaliser from './blockquote-normaliser';
import figureContentReducer from './figure-content-reducer';
import shortcodeConverter from './shortcode-converter';
import markdownConverter from './markdown-converter';
import iframeRemover from './iframe-remover';
import {
	deepFilterHTML,
	isPlain,
	removeInvalidHTML,
	getPhrasingContentSchema,
	getBlockContentSchema,
} from './utils';

/**
 * Browser dependencies
 */
const { log, warn } = window.console;

export { getPhrasingContentSchema };

/**
 * Filters HTML to only contain phrasing content.
 *
 * @param {string} HTML The HTML to filter.
 *
 * @return {string} HTML only containing phrasing content.
 */
function filterInlineHTML( HTML ) {
	HTML = deepFilterHTML( HTML, [ phrasingContentReducer ] );
	HTML = removeInvalidHTML( HTML, getPhrasingContentSchema(), { inline: true } );

	// Allows us to ask for this information when we get a report.
	log( 'Processed inline HTML:\n\n', HTML );

	return HTML;
}

function getRawTransformations() {
	return filter( getBlockTransforms( 'from' ), { type: 'raw' } )
		.map( ( transform ) => {
			return transform.isMatch ? transform : {
				...transform,
				isMatch: ( node ) => transform.selector && node.matches( transform.selector ),
			};
		} );
}

/**
 * Converts an HTML string to known blocks. Strips everything else.
 *
 * @param {string}  [options.HTML]                     The HTML to convert.
 * @param {string}  [options.plainText]                Plain text version.
 * @param {string}  [options.mode]                     Handle content as blocks or inline content.
 *                                                     * 'AUTO': Decide based on the content passed.
 *                                                     * 'INLINE': Always handle as inline content, and return string.
 *                                                     * 'BLOCKS': Always handle as blocks, and return array of blocks.
 * @param {Array}   [options.tagName]                  The tag into which content will be inserted.
 * @param {boolean} [options.canUserUseUnfilteredHTML] Whether or not the user can use unfiltered HTML.
 *
 * @return {Array|string} A list of blocks or a string, depending on `handlerMode`.
 */
export default function rawHandler( { HTML = '', plainText = '', mode = 'AUTO', tagName, canUserUseUnfilteredHTML = false } ) {
	// First of all, strip any meta tags.
	HTML = HTML.replace( /<meta[^>]+>/, '' );

	// If we detect block delimiters, parse entirely as blocks.
	if ( mode !== 'INLINE' && HTML.indexOf( '<!-- wp:' ) !== -1 ) {
		return parseWithGrammar( HTML );
	}

	// Normalize unicode to use composed characters.
	// This is unsupported in IE 11 but it's a nice-to-have feature, not mandatory.
	// Not normalizing the content will only affect older browsers and won't
	// entirely break the app.
	// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
	// See: https://core.trac.wordpress.org/ticket/30130
	// See: https://github.com/WordPress/gutenberg/pull/6983#pullrequestreview-125151075
	if ( String.prototype.normalize ) {
		HTML = HTML.normalize();
	}

	// Parse Markdown (and encoded HTML) if:
	// * There is a plain text version.
	// * There is no HTML version, or it has no formatting.
	if ( plainText && ( ! HTML || isPlain( HTML ) ) ) {
		HTML = markdownConverter( plainText );

		// Switch to inline mode if:
		// * The current mode is AUTO.
		// * The original plain text had no line breaks.
		// * The original plain text was not an HTML paragraph.
		// * The converted text is just a paragraph.
		if (
			mode === 'AUTO' &&
			plainText.indexOf( '\n' ) === -1 &&
			plainText.indexOf( '<p>' ) !== 0 &&
			HTML.indexOf( '<p>' ) === 0
		) {
			mode = 'INLINE';
		}
	}

	if ( mode === 'INLINE' ) {
		return filterInlineHTML( HTML );
	}

	// An array of HTML strings and block objects. The blocks replace matched
	// shortcodes.
	const pieces = shortcodeConverter( HTML );

	// The call to shortcodeConverter will always return more than one element
	// if shortcodes are matched. The reason is when shortcodes are matched
	// empty HTML strings are included.
	const hasShortcodes = pieces.length > 1;

	if ( mode === 'AUTO' && ! hasShortcodes && isInlineContent( HTML, tagName ) ) {
		return filterInlineHTML( HTML );
	}

	const rawTransformations = getRawTransformations();
	const phrasingContentSchema = getPhrasingContentSchema();
	const blockContentSchema = getBlockContentSchema( rawTransformations );

	return compact( flatMap( pieces, ( piece ) => {
		// Already a block from shortcode.
		if ( typeof piece !== 'string' ) {
			return piece;
		}

		const filters = [
			msListConverter,
			listReducer,
			imageCorrector,
			phrasingContentReducer,
			specialCommentConverter,
			figureContentReducer,
			blockquoteNormaliser,
		];

		if ( ! canUserUseUnfilteredHTML ) {
			// Should run before `figureContentReducer`.
			filters.unshift( iframeRemover );
		}

		const schema = {
			...blockContentSchema,
			// Keep top-level phrasing content, normalised by `normaliseBlocks`.
			...phrasingContentSchema,
		};

		piece = deepFilterHTML( piece, filters, blockContentSchema );
		piece = removeInvalidHTML( piece, schema );
		piece = normaliseBlocks( piece );

		// Allows us to ask for this information when we get a report.
		log( 'Processed HTML piece:\n\n', piece );

		const doc = document.implementation.createHTMLDocument( '' );

		doc.body.innerHTML = piece;

		return Array.from( doc.body.children ).map( ( node ) => {
			const rawTransformation = findTransform( rawTransformations, ( { isMatch } ) => isMatch( node ) );

			if ( ! rawTransformation ) {
				warn(
					'A block registered a raw transformation schema for `' + node.nodeName + '` but did not match it. ' +
					'Make sure there is a `selector` or `isMatch` property that can match the schema.\n' +
					'Sanitized HTML: `' + node.outerHTML + '`'
				);

				return;
			}

			const { transform, blockName } = rawTransformation;

			if ( transform ) {
				return transform( node );
			}

			return createBlock(
				blockName,
				getBlockAttributes(
					getBlockType( blockName ),
					node.outerHTML
				)
			);
		} );
	} ) );
}
