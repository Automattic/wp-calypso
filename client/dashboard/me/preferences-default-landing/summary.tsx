import { rawUserPreferencesQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { pin } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

type LandingPage = 'primary-site-dashboard' | 'sites' | 'reader';

const LANDING_PAGE_LABELS: Record< LandingPage, string > = {
	'primary-site-dashboard': __( 'Primary site dashboard' ),
	sites: __( 'Sites list' ),
	reader: __( 'Reader' ),
};

export default function PreferencesDefaultLandingSummary() {
	const { data: landingPage } = useSuspenseQuery( {
		...rawUserPreferencesQuery(),
		select: ( preferences ): LandingPage => {
			if ( preferences[ 'sites-landing-page' ]?.useSitesAsLandingPage ) {
				return 'sites';
			}
			if ( preferences[ 'reader-landing-page' ]?.useReaderAsLandingPage ) {
				return 'reader';
			}
			return 'primary-site-dashboard';
		},
	} );

	const badges: SummaryButtonBadgeProps[] = [
		{
			text: LANDING_PAGE_LABELS[ landingPage ],
			intent: 'default',
		},
	];

	return (
		<RouterLinkSummaryButton
			to="/me/preferences/default-landing-page"
			title={ __( 'Default landing page' ) }
			description={ __( 'Choose what you see after logging into WordPress.com' ) }
			decoration={ <Icon icon={ pin } /> }
			badges={ badges }
		/>
	);
}
