import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import GuidedTour from 'calypso/a8c-for-agencies/components/guided-tour';
import { SiteData } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { useSelector } from 'calypso/state';
import { getPreference } from 'calypso/state/preferences/selectors';
import SitesDashboardContext from '../../sites/sites-dashboard-context';
import { A4A_ONBOARDING_TOURS_PREFERENCE_NAME } from '../constants';

import '../style.scss';

interface Props {
	siteItems: Array< SiteData >;
}

export default function AddNewSiteTourStep2( { siteItems }: Props ) {
	const translate = useTranslate();
	const { mostRecentConnectedSite } = useContext( SitesDashboardContext );
	const hasFinishedStep1 = useSelector( ( state ) =>
		getPreference( state, A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ 'addSiteStep1' ] )
	);
	// We should only render the second step if the first one has finished (hasFinishedStep1) and we have a new connected site (mostRecentConnectedSite).
	// to do: implement mostRecentConnectedSite
	const shouldRenderAddSiteTourStep2 = hasFinishedStep1 && mostRecentConnectedSite;

	const tourHTMLTarget =
		siteItems.length < 20
			? 'tr.is-most-recent-jetpack-connected-site td:first-of-type'
			: '.site-table__table th:first-of-type';

	return (
		shouldRenderAddSiteTourStep2 && (
			<GuidedTour
				className="onboarding-tours__guided-tour"
				preferenceName={ A4A_ONBOARDING_TOURS_PREFERENCE_NAME[ 'addSiteStep2' ] }
				redirectAfterTourEnds="/overview"
				tours={ [
					{
						target: tourHTMLTarget,
						popoverPosition: 'bottom right',
						title: translate( '🎉 Your new site is here' ),
						description: (
							<>
								{ translate( 'Check out your new site here. That was straightforward, right?' ) }
								<br />
								<br />
								{ translate(
									'Sites with Jetpack installed will automatically appear in the site management view.'
								) }
							</>
						),
					},
				] }
			/>
		)
	);
}
