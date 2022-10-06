import PropTypes from 'prop-types';
import AutoDirection from 'calypso/components/auto-direction';

import './style.scss';

const ReaderExcerpt = ( { post } ) => {
	let excerpt = post.better_excerpt || post.excerpt;

	// Excerpt is set to use webkit-line-clamp to limit number of lines of text to show inside container
	// If we use an excerpt with no html, then text that contains <br> will appear on the same line with incorrect spacing.
	// If we use an excerpt with html, we need to remove the paragraph tags to avoid multiple containers that are subject to webkit-line-clamp
	const paragraphs = excerpt.split( '<p>' );
	const lines = [];

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
