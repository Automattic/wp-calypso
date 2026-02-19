import { rawUserPreferencesQuery, userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery, useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { wordpress } from '@wordpress/icons';
import { useAppContext } from '../../app/context';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { getSiteDisplayName } from '../../utils/site-name';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

type LandingPage = 'primary-site-dashboard' | 'sites' | 'reader';

const LANDING_PAGE_LABELS: Record< LandingPage, string > = {
	'primary-site-dashboard': __( 'Primary site dashboard' ),
	sites: __( 'Sites list' ),
	reader: __( 'Reader' ),
};

export default function PreferencesDefaultLandingSummary() {
	const { queries } = useAppContext();

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

	const { data: primarySiteId } = useSuspenseQuery( {
		...userSettingsQuery(),
		select: ( data ) => data.primary_site_ID,
	} );

	const { data: sites } = useQuery(
		queries.sitesQuery( { site_visibility: 'visible', include_a8c_owned: false } )
	);

	const primarySite = sites?.find( ( site ) => site.ID === primarySiteId );
	const primarySiteName = primarySite ? getSiteDisplayName( primarySite ) : undefined;

	const badges: SummaryButtonBadgeProps[] = [
		{
			text: LANDING_PAGE_LABELS[ landingPage ],
			intent: 'default',
		},
		...( primarySiteName
			? [
					{
						text: primarySiteName,
						intent: 'default' as const,
					},
			  ]
			: [] ),
	];

	return (
		<RouterLinkSummaryButton
			to="/me/preferences/default-landing-page"
			title={ __( 'WordPress.com defaults' ) }
			description={ __( 'Set your starting point after you log in and primary site.' ) }
			decoration={ <Icon icon={ wordpress } /> }
			badges={ badges }
		/>
	);
}
