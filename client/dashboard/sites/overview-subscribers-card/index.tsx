import { __ } from '@wordpress/i18n';
import { people } from '@wordpress/icons';
import OverviewCard from '../../components/overview-card';
import type { Site } from '@automattic/api-core';

export default function SubscribersCard( { site }: { site: Site } ) {
	return (
		<OverviewCard
			icon={ people }
			title={ __( 'Subscribers' ) }
			heading={ site.subscribers_count }
			description={ __( 'Total subscribers.' ) }
			link={ `https://cloud.jetpack.com/subscribers/${ site.slug }` }
			intent="success"
			tracksId="site-overview-subscribers"
		/>
	);
}
