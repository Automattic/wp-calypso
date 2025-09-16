/**
 * External dependencies
 */
import { Card } from '@automattic/components';
import React, { useState, useEffect } from 'react';
import { getRelativeTimeString } from 'calypso/dashboard/utils/datetime';
import { decodeEntities } from 'calypso/lib/formatting';
import './link-preview.scss';

interface LinkPreviewProps {
	url: string;
}

interface PreviewData {
	title: string;
	description?: string;
	image?: string;
	favicon?: string;
	siteName?: string;
	type?: string;
	publishedTime?: string;
	modifiedTime?: string;
	imageAlt?: string;
	url: string;
	domain: string;
}

interface OpenGraphData {
	title?: string;
	description?: string;
	image?: string;
	favicon?: string;
	siteName?: string;
	type?: string;
	publishedTime?: string;
	modifiedTime?: string;
	imageAlt?: string;
}

/**
 * Resolves a relative URL to an absolute URL using a base URL
 * @param {string} url - The URL to resolve (may be relative or absolute)
 * @param {string} baseUrl - The base URL to resolve against
 * @returns {string} - The resolved absolute URL
 */
function resolveUrl( url: string, baseUrl: string ): string {
	try {
		return new URL( url, baseUrl ).href;
	} catch {
		return url; // Return original if resolution fails
	}
}

/**
 * Parses OpenGraph tags from HTML content
 * @param {string} html - HTML content to parse
 * @param {string} baseUrl - The base URL for resolving relative URLs
 * @returns {Object} - Extracted OpenGraph data
 */
function parseOpenGraphTags( html: string, baseUrl: string ): OpenGraphData {
	const ogData: OpenGraphData = {};

	// Helper function to extract meta tag content
	const extractMetaContent = ( property: string ): string | undefined => {
		const match = html.match(
			new RegExp( `<meta\\s+property=["']${ property }["']\\s+content=["']([^"']*?)["']`, 'i' )
		);
		return match?.[ 1 ];
	};

	// Map of OpenGraph properties to object keys
	const propertyMap: Record< string, keyof OpenGraphData > = {
		'og:title': 'title',
		'og:description': 'description',
		'og:image': 'image',
		'og:site_name': 'siteName',
		'og:type': 'type',
		'article:published_time': 'publishedTime',
		'og:image:alt': 'imageAlt',
	};

	// Extract all OpenGraph properties
	for ( const [ property, key ] of Object.entries( propertyMap ) ) {
		const value = extractMetaContent( property );
		if ( value ) {
			// Decode HTML entities for text content
			const shouldDecode = [ 'title', 'description', 'imageAlt', 'siteName' ].includes( key );
			const processedValue = shouldDecode ? decodeEntities( value ) : value;
			// Resolve relative URLs for images
			ogData[ key ] = key === 'image' ? resolveUrl( processedValue, baseUrl ) : processedValue;
		}
	}

	// Fallback to <title> tag if og:title is not found
	if ( ! ogData.title ) {
		const titleMatch = html.match( /<title[^>]*>([^<]+)<\/title>/i );
		if ( titleMatch ) {
			ogData.title = decodeEntities( titleMatch[ 1 ] );
		}
	}

	// Extract favicon from link tags, prioritizing image/x-icon type
	if ( ! ogData.favicon ) {
		// First try to find image/x-icon favicons
		const xIconMatch =
			html.match( /<link[^>]*type=["']image\/x-icon["'][^>]*href=["']([^"']*?)["']/i ) ||
			html.match( /<link[^>]*href=["']([^"']*?)["'][^>]*type=["']image\/x-icon["']/i );

		if ( xIconMatch ) {
			ogData.favicon = resolveUrl( xIconMatch[ 1 ], baseUrl );
		} else {
			// Fallback to any favicon
			const faviconMatch =
				html.match( /<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']*?)["']/i ) ||
				html.match( /<link[^>]+href=["']([^"']*?)["'][^>]+rel=["'](?:icon|shortcut icon)["']/i );
			if ( faviconMatch ) {
				ogData.favicon = resolveUrl( faviconMatch[ 1 ], baseUrl );
			}
		}
	}

	return ogData;
}

/**
 * Link Preview Component
 *
 * Displays a preview card for a URL with title, description, and favicon
 * @param {Object} props - Component props
 * @param {string} props.url - The URL to preview
 * @returns {React.Component} Link preview component
 */
export default function LinkPreview( { url }: LinkPreviewProps ): JSX.Element | null {
	const [ previewData, setPreviewData ] = useState< PreviewData | null >( null );
	const [ isLoading, setIsLoading ] = useState< boolean >( true );
	const [ error, setError ] = useState< string | null >( null );

	useEffect( () => {
		const fetchPreviewData = async () => {
			try {
				setIsLoading( true );

				const corsProxy = 'https://api.allorigins.win/raw?url=';

				try {
					// Try to fetch the page directly using CORS proxy
					const response = await fetch( corsProxy + encodeURIComponent( url ) );

					if ( response.ok ) {
						const html = await response.text();
						const ogData = parseOpenGraphTags( html, url );

						// Only create preview if we have title AND at least one other useful piece of metadata
						if ( ogData.title && ( ogData.description || ogData.image || ogData.siteName ) ) {
							const domain = new URL( url ).hostname;
							setPreviewData( {
								title: ogData.title || domain,
								description: ogData.description || url,
								image: ogData.image || undefined,
								favicon:
									ogData.favicon || `https://www.google.com/s2/favicons?domain=${ domain }&sz=48`,
								siteName: ogData.siteName || domain,
								type: ogData.type || undefined,
								publishedTime: ogData.publishedTime || undefined,
								modifiedTime: ogData.modifiedTime || undefined,
								imageAlt: ogData.imageAlt || ogData.title || '',
								url: url,
								domain: domain,
							} );
							setIsLoading( false );
							return;
						}
					}
				} catch ( apiError ) {
					// Silently continue to fallback
				}
			} catch ( err ) {
				setError( 'Could not load preview' );
			}

			setIsLoading( false );
		};

		fetchPreviewData();
	}, [ url ] );

	if ( isLoading || error || ! previewData ) {
		return null;
	}

	return (
		<Card className="reader-full-post__link-preview">
			<a
				href={ url }
				target="_blank"
				rel="noopener noreferrer"
				className="reader-full-post__link-preview-link"
			>
				{ previewData.image && (
					<img
						src={ previewData.image }
						alt={ previewData.imageAlt || previewData.title }
						className="reader-full-post__link-preview-image"
						onError={ ( e ) => {
							const target = e.target as HTMLImageElement;
							target.style.display = 'none';
						} }
					/>
				) }
				<div className="reader-full-post__link-preview-content">
					<div className="reader-full-post__link-preview-header">
						{ previewData.favicon && (
							<img
								src={ previewData.favicon }
								alt=""
								className="reader-full-post__link-preview-favicon"
								onError={ ( e ) => {
									const target = e.target as HTMLImageElement;
									target.style.display = 'none';
								} }
							/>
						) }
						<span className="reader-full-post__link-preview-site-name">
							{ previewData.siteName || previewData.domain }
						</span>
						{ previewData.type && previewData.type !== 'article' && (
							<span className="reader-full-post__link-preview-type">{ previewData.type }</span>
						) }
					</div>
					<h4 className="reader-full-post__link-preview-title">{ previewData.title }</h4>
					{ previewData.description && previewData.description !== previewData.title && (
						<p className="reader-full-post__link-preview-description">
							{ previewData.description }
						</p>
					) }
					{ previewData.publishedTime && (
						<span className="reader-full-post__link-preview-date">
							{ getRelativeTimeString( new Date( previewData.publishedTime ) ) }
						</span>
					) }
				</div>
			</a>
		</Card>
	);
}
