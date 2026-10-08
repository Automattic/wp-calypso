import { Icon } from '@wordpress/components';
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

/**
 * The resource's thumbnail, or its illustration when it has none or the image
 * fails to load. Decorative: the modal's title names the resource, and its open
 * button opens it.
 */
export default function ResourcePreview( { resource }: { resource: AgencyEnablementResource } ) {
	const [ hasFailed, setHasFailed ] = useState( false );
	const [ hasLoaded, setHasLoaded ] = useState( false );
	const hasThumbnail = !! resource.thumbnail_url && ! hasFailed;
	const isLoading = hasThumbnail && ! hasLoaded;

	return (
		<div
			className="dashboard-resources-learn__preview"
			data-product={ resource.product }
			data-loading={ isLoading || undefined }
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
			{ resource.format === 'video' && (
				<span className="dashboard-resources-learn__preview-play">
					<Icon icon={ play } size={ 28 } />
				</span>
			) }
		</div>
	);
}
