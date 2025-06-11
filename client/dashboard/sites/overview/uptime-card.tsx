import { useQuery } from '@tanstack/react-query';
import { VisuallyHidden } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { connection } from '@wordpress/icons';
import { siteUptimeQuery } from '../../a../../app/queries/site-uptime';
import { TextBlur } from '../../components/text-blur';
import OverviewCard, { OverviewCardProgressBar } from '../overview-card';
import type { Site } from '../../data/types';

import './style.scss';

function UptimeCardEnabled( { siteId }: { siteId: string } ) {
	const { data: siteUptime } = useQuery( siteUptimeQuery( siteId ) );

	let uptimePercentage;

	if ( siteUptime ) {
		const { upDays, downDays } = Object.entries( siteUptime ).reduce(
			( accumulator, [ , { status } = {} ] ) => {
				accumulator[ status === 'up' ? 'upDays' : 'downDays' ] += 1;
				return accumulator;
			},
			{ upDays: 0, downDays: 0 }
		);
		uptimePercentage = Math.round( ( ( upDays / ( upDays + downDays ) ) * 1000 ) / 10 );
	}

	/* translators: %s: percentage of site uptime. Eg. 99% */
	const percentageString = __( '%s%%' );

	return (
		<OverviewCard
			title={ __( 'Uptime' ) }
			icon={ connection }
			heading={
				uptimePercentage === undefined ? (
					<>
						<TextBlur>{ sprintf( percentageString, '100' ) }</TextBlur>
						<VisuallyHidden>{ __( 'Loading…' ) }</VisuallyHidden>
					</>
				) : (
					sprintf( percentageString, uptimePercentage )
				)
			}
			metaText={ __( 'Past 30 days' ) }
		>
			<OverviewCardProgressBar value={ uptimePercentage } />
		</OverviewCard>
	);
}

export default function UptimeCard( { site }: { site: Site } ) {
	return site.jetpack_modules?.includes( 'monitor' ) ? (
		<UptimeCardEnabled siteId={ site.ID } />
	) : null /* Opportunity for upsell? */;
}
