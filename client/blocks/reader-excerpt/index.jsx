import PropTypes from 'prop-types';
import AutoDirection from 'calypso/components/auto-direction';

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

const ReaderExcerpt = ( { post } ) => {
	// post.excerpt - custom excerpt
	// post.better_excerpt - HTML excerpt generated from post content
	let excerpt = post.excerpt || post.better_excerpt;

	if ( excerpt !== undefined ) {
		// Update excerpt to work with webkit-line-clamp
		excerpt = convertExcerptNewlinesToBreaks( excerpt );
	}

	// If no valid excerpt, use either `content_no_html` or null
	if ( excerpt === undefined ) {
		excerpt = post.content_no_html || null;
	}

	return (
		<AutoDirection>
			<div
				className="reader-excerpt__content reader-excerpt"
				dangerouslySetInnerHTML={ { __html: excerpt } } // eslint-disable-line react/no-danger
			/>
		</AutoDirection>
	);
};

ReaderExcerpt.propTypes = {
	post: PropTypes.object.isRequired,
	isDiscover: PropTypes.bool,
};

export default ReaderExcerpt;
