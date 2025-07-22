import { useQuery } from '@tanstack/react-query';
import { VisuallyHidden } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { connection } from '@wordpress/icons';
import { siteUptimeQuery } from '../../a../../app/queries/site-uptime';
import { TextBlur } from '../../components/text-blur';
import OverviewCard, { OverviewCardProgressBar } from '../overview-card';
import type { Site } from '../../data/types';

import './style.scss';

function UptimeCardEnabled( { siteId }: { siteId: number } ) {
	const { data: uptime } = useQuery( siteUptimeQuery( siteId ) );

	return (
		<OverviewCard
			title={ __( 'Uptime' ) }
			icon={ connection }
			heading={
				! uptime ? (
					<>
						<TextBlur>100%</TextBlur>
						<VisuallyHidden>{ __( 'Loading…' ) }</VisuallyHidden>
					</>
				) : (
					`${ uptime }%`
				)
			}
			description={ __( 'Past 30 days' ) }
			bottom={ <OverviewCardProgressBar value={ uptime } /> }
		/>
	);
}

export default function UptimeCard( { site }: { site: Site } ) {
	return site.jetpack_modules?.includes( 'monitor' ) ? (
		<UptimeCardEnabled siteId={ site.ID } />
	) : null /* Opportunity for upsell? */;
}
