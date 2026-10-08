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

interface ResourcePreviewProps {
	resource: AgencyEnablementResource;
	onOpen: ( resource: AgencyEnablementResource ) => void;
}

/**
 * The resource's thumbnail, or its illustration when it has none or the image
 * fails to load. Clicking it opens the resource; it's left out of the tab order
 * because the modal's open button does the same for keyboard users.
 */
export default function ResourcePreview( { resource, onOpen }: ResourcePreviewProps ) {
	const [ hasFailed, setHasFailed ] = useState( false );
	const [ hasLoaded, setHasLoaded ] = useState( false );
	const hasThumbnail = !! resource.thumbnail_url && ! hasFailed;
	const isLoading = hasThumbnail && ! hasLoaded;

	return (
		<a
			className="dashboard-resources-learn__preview"
			data-product={ resource.product }
			href={ resource.external_url }
			target="_blank"
			rel="noopener noreferrer"
			tabIndex={ -1 }
			aria-hidden="true"
			data-loading={ isLoading || undefined }
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
			{ resource.format === 'video' && (
				<span className="dashboard-resources-learn__preview-play">
					<Icon icon={ play } size={ 28 } />
				</span>
			) }
		</a>
	);
}
