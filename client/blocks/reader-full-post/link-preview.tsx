/**
 * External dependencies
 */
import { Card, Spinner } from '@automattic/components';
import React, { useState, useEffect } from 'react';
import { getRelativeTimeString } from 'calypso/dashboard/utils/datetime';
import wpcom from 'calypso/lib/wp';
import './link-preview.scss';

interface LinkPreviewProps {
	url: string;
}

interface LinkPreviewData {
	title: string;
	description?: string;
	image?: string;
	favicon: string;
	site_name?: string;
	type?: string;
	published_time?: string;
	image_alt?: string;
	url: string;
	domain: string;
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
	const [ previewData, setPreviewData ] = useState< LinkPreviewData | null >( null );
	const [ isLoading, setIsLoading ] = useState< boolean >( true );

	useEffect( () => {
		setIsLoading( true );

		const params = {
			path: '/read/link-preview',
			apiNamespace: 'wpcom/v2',
		};

		// Use the WordPress REST API endpoint for link previews
		wpcom.req
			.get( params, { url } )
			.then( setPreviewData )
			.catch( () => {
				// Any error (400, 404, etc.) means no preview available
				setPreviewData( null );
			} )
			.finally( () => {
				setIsLoading( false );
			} );
	}, [ url ] );

	if ( isLoading ) {
		return (
			<Card className="reader-full-post__link-preview is-loading">
				<Spinner />
			</Card>
		);
	}

	if ( ! previewData ) {
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
						alt={ previewData.image_alt || previewData.title }
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
							{ previewData.site_name || previewData.domain }
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
					{ previewData.published_time && (
						<span className="reader-full-post__link-preview-date">
							{ getRelativeTimeString( new Date( previewData.published_time ) ) }
						</span>
					) }
				</div>
			</a>
		</Card>
	);
}
