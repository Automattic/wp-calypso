import { useState } from 'react';
import ResourceIllustration from './card/illustration';
import type { AgencyEnablementResource } from '@automattic/api-core';

/**
 * The resource's thumbnail, or its illustration when it has none or the image
 * fails to load.
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
		</div>
	);
}
