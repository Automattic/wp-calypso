import { __ } from '@wordpress/i18n';
import { people } from '@wordpress/icons';
import OverviewCard from '../../components/overview-card';
import { getSiteSubscribersUrl } from '../../utils/site-subscribers';
import type { Site } from '@automattic/api-core';

export default function SubscribersCard( { site }: { site: Site } ) {
	return (
		<OverviewCard
			icon={ people }
			title={ __( 'Subscribers' ) }
			heading={ site.subscribers_count }
			description={ __( 'Total subscribers.' ) }
			link={ getSiteSubscribersUrl( site ) }
			intent="success"
			tracksId="site-overview-subscribers"
		/>
	);
}
