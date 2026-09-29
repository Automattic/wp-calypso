import { __, sprintf } from '@wordpress/i18n';
import { external, Icon } from '@wordpress/icons';
import { useCallback, useState } from 'react';
import ResourceDocumentThumbnail from './resource-document-thumbnail';
import ResourceThumbnail from './resource-thumbnail';
import { resourceVideoCovers } from './resource-video-covers';
import type { DocumentThumbnailInfo } from './resource-document-thumbnail';
import type { LibraryResource } from './types';

function getCoverImage( resource: LibraryResource ) {
	if ( resourceVideoCovers[ resource.id ] ) {
		return resourceVideoCovers[ resource.id ];
	}
	const url = new URL( resource.url );
	const googleId = url.pathname.match( /\/d\/([^/]+)/ )?.[ 1 ];
	if ( googleId && [ 'drive.google.com', 'docs.google.com' ].includes( url.hostname ) ) {
		const params = new URLSearchParams( { id: googleId, sz: 'w800' } );
		const key = url.searchParams.get( 'resourcekey' );
		if ( key ) {
			params.set( 'resourcekey', key );
		}
		return `https://drive.google.com/thumbnail?${ params }`;
	}
	let youtubeId: string | null = null;
	if ( url.hostname === 'youtu.be' ) {
		youtubeId = url.pathname.slice( 1 );
	} else if ( [ 'youtube.com', 'www.youtube.com' ].includes( url.hostname ) ) {
		youtubeId = url.searchParams.get( 'v' );
	}
	if ( youtubeId ) {
		return `https://i.ytimg.com/vi/${ encodeURIComponent( youtubeId ) }/hqdefault.jpg`;
	}
	if ( resource.format === 'Webpage' ) {
		return `https://s0.wp.com/mshots/v1/${ encodeURIComponent( resource.url ) }?w=800&h=600`;
	}
	return undefined;
}

export default function ResourceDetailArtwork( { resource }: { resource: LibraryResource } ) {
	const [ failed, setFailed ] = useState( false );
	const handleError = useCallback( () => setFailed( true ), [] );
	const [ imageAspect, setImageAspect ] = useState< number >();
	const [ documentInfo, setDocumentInfo ] = useState< DocumentThumbnailInfo >();
	const pdf = resource.format === 'PDF';
	const video = resource.format === 'Video';

	const image = ! pdf && getCoverImage( resource );
	const loading = ! failed && ( pdf ? ! documentInfo : !! image && ! imageAspect );
	const loaded = pdf ? !! documentInfo : !! imageAspect;
	return (
		<a
			className="resource-detail-artwork"
			data-kind={ video ? 'video' : 'document' }
			data-loading={ loading }
			data-loaded={ loaded }
			aria-busy={ loading }
			href={ resource.url }
			target="_blank"
			rel="noopener noreferrer"
			aria-label={
				video
					? sprintf(
							/* translators: %s is the resource title. */ __( 'Play %s in a new tab' ),
							resource.title
					  )
					: sprintf(
							/* translators: %s is the resource title. */ __( 'Open %s in a new tab' ),
							resource.title
					  )
			}
		>
			<span className="resource-detail-object" aria-hidden="true">
				<span className="resource-detail-sheet">
					<span className="resource-detail-fallback">
						<ResourceThumbnail contentType={ resource.contentType } />
					</span>
					{ pdf ? (
						<ResourceDocumentThumbnail
							url={ resource.url }
							onLoad={ setDocumentInfo }
							onError={ handleError }
						/>
					) : (
						image &&
						! failed && (
							<img
								className="resource-detail-cover"
								src={ image }
								alt=""
								onLoad={ ( event ) => {
									const img = event.currentTarget;
									if ( img.naturalHeight ) {
										setImageAspect( img.naturalWidth / img.naturalHeight );
									}
								} }
								onError={ handleError }
							/>
						)
					) }
					<span className="resource-detail-open">
						{ video ? (
							<svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
								<path d="M8 5v14l11-7Z" />
							</svg>
						) : (
							<Icon icon={ external } size={ 28 } />
						) }
						<span className="resource-detail-open-label">
							{ video ? __( 'Play in new tab' ) : __( 'Open in new tab' ) }
						</span>
					</span>
				</span>
			</span>
		</a>
	);
}
