import { __ } from '@wordpress/i18n';
import SitePreviewLinks from '../site-preview-links';
import type { Site } from '../../data/types';

export function ShareSiteForm( { site }: { site: Site } ) {
	return (
		<SitePreviewLinks
			site={ site }
			title={ __( 'Share site' ) }
			description={ __( 'Give collaborators without an account access to view your site.' ) }
		/>
	);
}
