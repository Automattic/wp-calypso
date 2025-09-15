/**
 * External dependencies
 */
import { Card, Spinner } from '@automattic/components';
import React, { useState, useEffect } from 'react';
import { getRelativeTimeString } from 'calypso/dashboard/utils/datetime';
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
 * Parses OpenGraph tags from HTML content
 * @param {string} html - HTML content to parse
 * @returns {Object} - Extracted OpenGraph data
 */
function parseOpenGraphTags( html: string ): OpenGraphData {
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
			ogData[ key ] = value;
		}
	}

	// Fallback to <title> tag if og:title is not found
	if ( ! ogData.title ) {
		const titleMatch = html.match( /<title[^>]*>([^<]+)<\/title>/i );
		if ( titleMatch ) {
			ogData.title = titleMatch[ 1 ];
		}
	}

	// Extract favicon from link tags
	if ( ! ogData.favicon ) {
		const faviconMatch =
			html.match( /<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']*?)["']/i ) ||
			html.match( /<link[^>]+href=["']([^"']*?)["'][^>]+rel=["'](?:icon|shortcut icon)["']/i );
		if ( faviconMatch ) {
			ogData.favicon = faviconMatch[ 1 ];
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
export default function LinkPreview( { url }: LinkPreviewProps ): JSX.Element {
	const [ previewData, setPreviewData ] = useState< PreviewData | null >( null );
	const [ isLoading, setIsLoading ] = useState< boolean >( true );
	const [ error, setError ] = useState< string | null >( null );

	useEffect( () => {
		const fetchPreviewData = async () => {
			try {
				setIsLoading( true );

				// For development/demo, let's try a CORS proxy approach
				const corsProxy = 'https://api.allorigins.win/raw?url=';

				try {
					// Try to fetch the page directly using CORS proxy
					const response = await fetch( corsProxy + encodeURIComponent( url ) );
					if ( response.ok ) {
						const html = await response.text();
						const ogData = parseOpenGraphTags( html );

						if ( ogData.title ) {
							const domain = new URL( url ).hostname;
							setPreviewData( {
								title: ogData.title || domain,
								description: ogData.description || url,
								image: ogData.image || undefined,
								favicon: ogData.favicon || `https://www.google.com/s2/favicons?domain=${ domain }`,
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

				// Fallback to basic metadata
				const domain = new URL( url ).hostname;
				setPreviewData( {
					title: domain,
					description: url,
					favicon: `https://www.google.com/s2/favicons?domain=${ domain }`,
					url: url,
					domain: domain,
				} );

				setIsLoading( false );
			} catch ( err ) {
				setError( 'Could not load preview' );
				setIsLoading( false );
			}
		};

		fetchPreviewData();
	}, [ url ] );

	if ( isLoading ) {
		return (
			<Card className="reader-full-post__link-preview is-loading">
				<Spinner />
			</Card>
		);
	}

	if ( error || ! previewData ) {
		return (
			<Card className="reader-full-post__link-preview is-error">
				<a href={ url } target="_blank" rel="noopener noreferrer">
					{ url }
				</a>
			</Card>
		);
	}

	const hasImage = !! previewData.image;
	const cardClass = `reader-full-post__link-preview ${ hasImage ? 'has-image' : 'no-image' }`;

	return (
		<Card className={ cardClass }>
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
					/>
				) }
				<div className="reader-full-post__link-preview-content">
					<div className="reader-full-post__link-preview-header">
						{ previewData.favicon && (
							<img
								src={ previewData.favicon }
								alt=""
								className="reader-full-post__link-preview-favicon"
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
