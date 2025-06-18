import { useQuery } from '@tanstack/react-query';
import { VisuallyHidden } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { connection } from '@wordpress/icons';
import { siteUptimeQuery } from '../../a../../app/queries/site-uptime';
import { TextBlur } from '../../components/text-blur';
import { getSiteUptime } from '../../utils/site-uptime';
import OverviewCard, { OverviewCardProgressBar } from '../overview-card';
import type { Site } from '../../data/types';

import './style.scss';

function UptimeCardEnabled( { siteId }: { siteId: number } ) {
	const { data: siteUptime } = useQuery( siteUptimeQuery( siteId ) );

	/* translators: %s: percentage of site uptime. Eg. 99% */
	const percentageString = __( '%s%%' );
	const uptime = getSiteUptime( siteUptime );

	return (
		<OverviewCard
			title={ __( 'Uptime' ) }
			icon={ connection }
			heading={
				! uptime ? (
					<>
						<TextBlur>{ sprintf( percentageString, '100' ) }</TextBlur>
						<VisuallyHidden>{ __( 'Loading…' ) }</VisuallyHidden>
					</>
				) : (
					uptime.label
				)
			}
			metaText={ __( 'Past 30 days' ) }
		>
			<OverviewCardProgressBar value={ uptime?.value } />
		</OverviewCard>
	);
}

export default function UptimeCard( { site }: { site: Site } ) {
	return site.jetpack_modules?.includes( 'monitor' ) ? (
		<UptimeCardEnabled siteId={ site.ID } />
	) : null /* Opportunity for upsell? */;
}
