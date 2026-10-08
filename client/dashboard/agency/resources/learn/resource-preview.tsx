import { Icon } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { external } from '@wordpress/icons';
import { Path, SVG } from '@wordpress/primitives';
import { useState } from 'react';
import ResourceIllustration from './card/illustration';
import type { AgencyEnablementResource } from '@automattic/api-core';

// @wordpress/icons has no play icon.
const play = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M8 5.5v13l10.5-6.5L8 5.5Z" fill="currentColor" />
	</SVG>
);

interface ResourcePreviewProps {
	resource: AgencyEnablementResource;
	onOpen: ( resource: AgencyEnablementResource ) => void;
}

/**
 * The resource's thumbnail, or its illustration when it has none or the image
 * fails to load, as a link that opens the resource.
 */
export default function ResourcePreview( { resource, onOpen }: ResourcePreviewProps ) {
	const [ hasFailed, setHasFailed ] = useState( false );
	const [ hasLoaded, setHasLoaded ] = useState( false );
	const hasThumbnail = !! resource.thumbnail_url && ! hasFailed;
	const isLoading = hasThumbnail && ! hasLoaded;
	const isVideo = resource.format === 'video';

	return (
		<a
			className="dashboard-resources-learn__preview"
			data-product={ resource.product }
			data-loading={ isLoading || undefined }
			data-video={ isVideo || undefined }
			href={ resource.external_url }
			target="_blank"
			rel="noopener noreferrer"
			aria-label={
				isVideo
					? /* translators: %s: The resource's title. */
						sprintf( __( 'Play %s in a new tab' ), resource.name )
					: /* translators: %s: The resource's title. */
						sprintf( __( 'Open %s in a new tab' ), resource.name )
			}
			onClick={ () => onOpen( resource ) }
		>
			{ /* The illustration stands in, animated, until the thumbnail loads, and stays if it fails. */ }
			{ ( ! hasThumbnail || isLoading ) && <ResourceIllustration resource={ resource } /> }
			{ hasThumbnail && (
				<img
					className="dashboard-resources-learn__preview-image"
					src={ resource.thumbnail_url ?? undefined }
					alt=""
					// Hidden images still load, so this waits for it without a placeholder.
					hidden={ isLoading }
					onLoad={ () => setHasLoaded( true ) }
					onError={ () => setHasFailed( true ) }
				/>
			) }
			<span className="dashboard-resources-learn__preview-open" aria-hidden="true">
				<Icon icon={ isVideo ? play : external } size={ 28 } />
				<span className="dashboard-resources-learn__preview-open-label">
					{ isVideo ? __( 'Play in new tab' ) : __( 'Open in new tab' ) }
				</span>
			</span>
		</a>
	);
}
