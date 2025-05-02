import { __ } from '@wordpress/i18n';
import { desktop, mobile } from '@wordpress/icons';
import CoreBadge from 'calypso/components/core/badge';
import { usePerformanceData } from '../hooks/use-performance-data';
import OverviewCard, { OverviewCardProgressBar } from '../overview-card';
import type { Site } from '../data/types';

type BadgeIntent = 'default' | 'info' | 'success' | 'warning' | 'error';

function PerformanceBadge( { value }: { value: number | undefined } ) {
	const badgeProps = { intent: 'error' as BadgeIntent, label: __( 'Poor' ) };
	if ( ! value ) {
		badgeProps.label = __( 'Calculating…' );
		badgeProps.intent = 'default';
	} else if ( value >= 90 ) {
		badgeProps.intent = 'success';
		badgeProps.label = __( 'Excellent' );
	} else if ( value >= 50 ) {
		badgeProps.intent = 'warning';
		badgeProps.label = __( 'Needs Improvement' );
	}
	return (
		<CoreBadge intent={ badgeProps.intent } style={ { width: 'fit-content' } }>
			{ badgeProps.label }
		</CoreBadge>
	);
}

export default function PerformanceCards( { site }: { site: Site } ) {
	const { desktopScore, mobileScore, desktopLoaded, mobileLoaded } = usePerformanceData(
		site.ID,
		site.URL
	);

	return (
		<>
			<OverviewCard
				title={ __( 'Desktop performance' ) }
				icon={ desktop }
				heading={ desktopLoaded ? `${ desktopScore }` : '\u00A0' }
			>
				<OverviewCardProgressBar value={ desktopScore } />
				<PerformanceBadge value={ desktopScore } />
			</OverviewCard>
			<OverviewCard
				title={ __( 'Mobile performance' ) }
				icon={ mobile }
				heading={ mobileLoaded ? `${ mobileScore }` : '\u00A0' }
			>
				<OverviewCardProgressBar value={ mobileScore } />
				<PerformanceBadge value={ mobileScore } />
			</OverviewCard>
		</>
	);
}
