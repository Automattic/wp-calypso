import React from 'react';
import LinkPreview from './link-preview';

interface ContentProcessorProps {
	content?: string;
}

/**
 * Validates if a URL is properly formatted and from an allowed domain
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if URL is valid and allowed
 */
function isValidUrl( url: string ): boolean {
	try {
		const urlObj = new URL( url );

		// Ensure it's http or https
		if ( ! [ 'http:', 'https:' ].includes( urlObj.protocol ) ) {
			return false;
		}

		// Reject URLs with invalid hostnames (must contain at least one dot for TLD)
		return urlObj.hostname.includes( '.' );
	} catch {
		return false;
	}
}

/**
 * Detects URLs in HTML content - both plain text URLs and URLs from href attributes.
 * @param {string} content - The HTML content to scan for URLs.
 * @returns {string|null} - First detected URL or null if none found.
 */
export function detectUrls( content: string ): string | null {
	// Skip URL detection if content contains media elements
	if ( /<(img|video|audio|iframe)[^>]*>/i.test( content ) ) {
		return null;
	}

	// First, look for plain text URLs (not in HTML tags)
	const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
	const plainTextUrlMatches = content.matchAll( urlRegex );

	for ( const urlMatch of plainTextUrlMatches ) {
		const url = urlMatch[ 0 ];
		const position = urlMatch.index;

		// Check if this URL is NOT part of an HTML tag and is valid
		if ( position !== undefined && ! isUrlInHtmlTag( content, position ) && isValidUrl( url ) ) {
			return url; // Return immediately after finding the first valid URL
		}
	}

	// Then, extract URLs from href attributes where the link text is also a URL
	const hrefRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
	let match;

	// First pass: look for links where the link text is a URL
	hrefRegex.lastIndex = 0; // Reset regex position
	while ( ( match = hrefRegex.exec( content ) ) !== null ) {
		const [ , url, linkText ] = match;
		// Only include valid URLs, skip mentions/hashtags
		if (
			isValidUrl( url ) &&
			! linkText.trim().startsWith( '@' ) &&
			! linkText.trim().startsWith( '#' )
		) {
			// Check if link text looks like a URL (strip HTML tags first)
			const linkTextTrimmed = linkText.replace( /<[^>]*>/g, '' ).trim();
			if ( linkTextTrimmed.match( /^https?:\/\// ) ) {
				return url;
			}
		}
	}

	return null;
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

	// Detect URL in the content.
	const url = detectUrls( content );

	return (
		<>
			<div
				className="reader-full-post__story-content"
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={ { __html: content } }
			/>
			{ url && <LinkPreview url={ url } /> }
		</>
	);
}
