import { __ } from '@wordpress/i18n';
import { shuffle } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import OverviewCard from '../../components/overview-card';
import { wpcomLink } from '../../utils/link';
import type { Site } from '@automattic/api-core';

export default function MigrateSiteCard( { site }: { site: Site } ) {
	return (
		<OverviewCard
			icon={ shuffle }
			title={ __( 'Migrate' ) }
			heading={ __( 'Migrate site' ) }
			description={ __( 'Bring your site to WordPress.com.' ) }
			link={ addQueryArgs( wpcomLink( '/setup/site-migration' ), {
				siteSlug: site.slug,
			} ) }
			intent="upsell"
			tracksId="site-overview-migrate-site"
			upsellFeatureId="site-migration"
		/>
	);
}
