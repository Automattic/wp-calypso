import { __ } from '@wordpress/i18n';
import { useSiteIsPreview } from '../site-fields/plan-awaiting-checkout';
import SitePreviewLinks from '../site-preview-links';
import type { Site } from '@automattic/api-core';

export function ShareSiteForm( { site }: { site: Site } ) {
	const { isLoading, isPreview } = useSiteIsPreview( site );

	if ( isLoading ) {
		return null;
	}

	// A preview is for sharing: it stays Coming Soon until it is bought, and its link is always on.
	return (
		<SitePreviewLinks
			site={ site }
			title={ __( 'Share site' ) }
			description={
				isPreview
					? __(
							'Visitors to your site see a Coming Soon page. Share this link so anyone can view it.'
						)
					: __( 'Give collaborators without an account access to view your site.' )
			}
			alwaysOn={ isPreview }
		/>
	);
}
