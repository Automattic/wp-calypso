import { rawUserPreferencesQuery, siteByIdQuery, userSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { commentAuthorAvatar } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { getSiteDisplayName } from '../../utils/site-name';
import type { Density } from '@automattic/components/src/summary-button/types';

function useLandingPageLabel() {
	const { data: landingPage } = useQuery( {
		...rawUserPreferencesQuery(),
		select: ( preferences ) => {
			if ( preferences[ 'sites-landing-page' ]?.useSitesAsLandingPage ) {
				return 'sites';
			}
			if ( preferences[ 'reader-landing-page' ]?.useReaderAsLandingPage ) {
				return 'reader';
			}
			return 'primary-site-dashboard';
		},
	} );

	switch ( landingPage ) {
		case 'sites':
			return __( 'Sites list' );
		case 'reader':
			return __( 'Reader' );
		default:
			return __( 'Primary site' );
	}
}

function usePrimarySiteName() {
	const { data: primarySiteId } = useQuery( {
		...userSettingsQuery(),
		select: ( data ) => data.primary_site_ID,
	} );

	const { data: primarySite } = useQuery( {
		...siteByIdQuery( primarySiteId ?? 0 ),
		enabled: !! primarySiteId,
	} );

	return primarySite ? getSiteDisplayName( primarySite ) : undefined;
}

export default function PreferencesDefaultsSummary( { density }: { density?: Density } ) {
	const landingPageLabel = useLandingPageLabel();
	const primarySiteName = usePrimarySiteName();

	const badges: { text: string }[] = [ { text: landingPageLabel } ];
	if ( primarySiteName ) {
		badges.push( { text: primarySiteName } );
	}

	return (
		<RouterLinkSummaryButton
			density={ density }
			to="/me/preferences/defaults"
			title={ __( 'Account defaults' ) }
			description={ __( 'Set your starting point after you log in and primary site.' ) }
			decoration={ <Icon icon={ commentAuthorAvatar } size={ 24 } /> }
			badges={ badges }
		/>
	);
}
