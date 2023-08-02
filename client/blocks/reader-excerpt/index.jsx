import classNames from 'classnames';
import { trim, escapeRegExp } from 'lodash';
import PropTypes from 'prop-types';
import AutoDirection from 'calypso/components/auto-direction';
import { domForHtml } from 'calypso/lib/post-normalizer/utils';

import './style.scss';

// Excerpt is set to use webkit-line-clamp to limit number of lines of text to show inside container
// If we use an excerpt with no html, then text that contains <br> will appear on the same line with incorrect spacing.
// If we use an excerpt with html, we need to remove the paragraph tags to avoid multiple containers that are subject to webkit-line-clamp
const convertExcerptNewlinesToBreaks = ( excerpt ) => {
	const paragraphs = excerpt.split( '<p>' );
	const lines = [];

	if ( paragraphs.length > 0 ) {
		// Split html text into paragraphs
		paragraphs.forEach( ( paragraph ) => {
			if ( paragraph.length !== 0 ) {
				// Remove paragraph closing tag
				let p = paragraph.replaceAll( '</p>', '' );
				// Clean up any newline chars
				p = p.replaceAll( '\n', '' );
				// Replace <br> tags with proper break tag
				p = p.replaceAll( '<br>', '<br />' );

				// Now split this text into lines based on break tags
				const breaks = p.split( '<br />' );

				// Append lines to array
				breaks.map( ( line ) => {
					lines.push( line );
				} );
			}
		} );

		// Re-join the lines into a html string with breaks
		excerpt = lines.join( '<br />' );
	}
	return excerpt;
};

/**
 * Removes double spaces and also &nbsp; characters which may be present in the excerpt.
 *
 * @param {string} str the string to normalize
 * @returns a string with single space characters.
 */
const normalizeWhitespace = ( str ) => {
	return str.replace( /\s+/g, ' ' );
};

/**
 * Gets the writing prompt text which was inserted as a pullquote at the begining of the post's content.
 *
 * @param {Object} post the post object
 * @returns writing prompt text
 */
const getDailyPromptText = ( post ) => {
	const dom = domForHtml( post.content );
	const promptQuote = dom.querySelector( '.wp-block-pullquote:first-child' );

	if ( promptQuote && promptQuote.innerText ) {
		// Remove double spaces which are not normalized by `HTMLElement.innerText`
		return normalizeWhitespace( promptQuote.innerText );
	}
	return null;
};

const chooseExcerpt = ( post ) => {
	// Need to figure out if custom excerpt is different to better_excerpt
	if ( post.excerpt?.length > 0 ) {
		// If the post is a dailyprompt, attempt to replace the prompt text with a pullquote.
		if ( post.tags && post.tags.hasOwnProperty( 'dailyprompt' ) ) {
			const promptText = getDailyPromptText( post );
			if ( promptText ) {
				// Remove the prompt text from start of the excerpt
				const excerpt = normalizeWhitespace( post.excerpt ).replace(
					new RegExp( '^' + escapeRegExp( promptText ) ),
					''
				);
				// And insert a blockquote with the prompt text
				return `<blockquote class="wp-block-pullquote"> ${ promptText } </blockquote> ${ excerpt }`;
			}
		}
		if ( post.short_excerpt === undefined ) {
			// If there is no short_excerpt, then there is no better_excerpt
			return post.excerpt;
		}
		// Remove … from short_excerpt
		const short_excerpt = post.short_excerpt.replaceAll( '…', '' );
		// Remove any non-alphanumeric chars to avoid string comparison issues, then trim
		const short_excerpt_chars = trim( short_excerpt.replace( /\W/g, '' ) );
		const custom_excerpt_chars = trim(
			post.excerpt.substring( 0, short_excerpt.length ).replace( /\W/g, '' )
		);

		if ( short_excerpt_chars !== custom_excerpt_chars ) {
			// In this case, the post excerpt is different to the short excerpt (which is a shortened version of the better_excerpt)
			// This is an indication of a custom excerpt which we should default to when display excerpts in the reader
			return post.excerpt;
		}
	}

	if ( post.better_excerpt !== undefined && post.better_excerpt.length > 0 ) {
		// If there is no custom excerpt then we should show the post's better_excerpt
		// We need to first update this excerpt to work with webkit-line-clamp so that it displays correctly in the reader
		return convertExcerptNewlinesToBreaks( post.better_excerpt );
	}

	if ( post.content_no_html !== undefined && post.content_no_html.length > 0 ) {
		// If there is no excerpt, then we fallback to displaying the post's content_no_html
		return post.content_no_html;
	}

	// If the post has no excerpt or content_no_html then we return null
	return null;
};

const ReaderExcerpt = ( { post } ) => {
	const isDailyPrompt = !! getDailyPromptText( post );

	return (
		<AutoDirection>
			<div
				className={ classNames( 'reader-excerpt__content reader-excerpt', {
					'reader-excerpt__daily-prompt': isDailyPrompt,
				} ) }
				dangerouslySetInnerHTML={ { __html: chooseExcerpt( post ) } } // eslint-disable-line react/no-danger
			/>
		</AutoDirection>
	);
};

ReaderExcerpt.propTypes = {
	post: PropTypes.object.isRequired,
};

export default ReaderExcerpt;
