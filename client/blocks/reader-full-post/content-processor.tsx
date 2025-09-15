import React from 'react';
import LinkPreview from './link-preview';

interface ContentProcessorProps {
	content?: string;
}

/**
 * Detects URLs in HTML content - both plain text URLs and URLs from href attributes.
 * @param {string} content - The HTML content to scan for URLs.
 * @returns {Array} - Array of detected URLs.
 */
function detectUrls( content: string ): string[] {
	const urls: string[] = [];

	// First, extract URLs from href attributes
	const hrefRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
	let match;

	while ( ( match = hrefRegex.exec( content ) ) !== null ) {
		const url = match[ 1 ];
		// Only include http/https URLs and avoid duplicates
		if ( url.startsWith( 'http' ) && ! urls.includes( url ) ) {
			urls.push( url );
		}
	}

	// Then, look for plain text URLs (not in HTML tags)
	const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
	const plainTextUrlMatches = content.matchAll( urlRegex );

	for ( const urlMatch of plainTextUrlMatches ) {
		const url = urlMatch[ 0 ];
		const position = urlMatch.index;

		// Check if this URL is NOT part of an HTML tag
		if (
			position !== undefined &&
			! isUrlInHtmlTag( content, position ) &&
			! urls.includes( url )
		) {
			urls.push( url );
		}
	}

	return urls;
}

/**
 * Simple check if a URL at the given position is part of an HTML tag.
 * @param {string} content - The content containing the URL.
 * @param {number} position - The position of the URL in the content.
 * @returns {boolean} - True if URL is part of an HTML tag, false otherwise.
 */
function isUrlInHtmlTag( content: string, position: number ): boolean {
	// Look backward for opening tag or closing tag
	for ( let i = position - 1; i >= 0; i-- ) {
		if ( content[ i ] === '<' ) {
			// Found opening tag before URL - URL is inside a tag
			return true;
		}
		if ( content[ i ] === '>' ) {
			// Found closing tag before URL - URL is not inside a tag
			return false;
		}
	}
	return false;
}

/**
 * Content Processor Component.
 *
 * Processes post content to find plain URLs and render link previews for them.
 * @param {Object} props - Component props.
 * @param {string} props.content - The HTML content to process.
 * @returns {React.Component} Processed content with link previews.
 */
export default function ContentProcessor( { content }: ContentProcessorProps ): JSX.Element | null {
	// If no content, return null
	if ( ! content ) {
		return null;
	}

	// Detect URLs in the content.
	const urls = detectUrls( content );

	// If no URLs found, just return the original content.
	if ( urls.length === 0 ) {
		return (
			<div
				className="reader-full-post__story-content"
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={ { __html: content } }
			/>
		);
	}

	// Create link previews for each URL.
	return (
		<div className="reader-full-post__processed-content">
			<div
				className="reader-full-post__story-content"
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={ { __html: content } }
			/>
			{ urls.map( ( url, index ) => (
				<LinkPreview key={ `link-preview-${ index }` } url={ url } />
			) ) }
		</div>
	);
}
