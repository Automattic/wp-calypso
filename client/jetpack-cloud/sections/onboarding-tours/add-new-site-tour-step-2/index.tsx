import { useTranslate } from 'i18n-calypso';
import { useContext, useState } from 'react';
import GuidedTour from 'calypso/jetpack-cloud/components/guided-tour';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import SitesOverviewContext from '../../agency-dashboard/sites-overview/context';
import { SiteData } from '../../agency-dashboard/sites-overview/types';
import { JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME } from '../constants';

import '../style.scss';

interface Props {
	siteItems: Array< SiteData >;
}

export default function AddNewSiteTourStep2( { siteItems }: Props ) {
	const translate = useTranslate();
	const { mostRecentConnectedSite } = useContext( SitesOverviewContext );
	const dispatch = useDispatch();
	const [ resetApplied, setResetApplied ] = useState( false );

	const hasFinishedStep1 = useSelector( ( state ) =>
		getPreference( state, JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME[ 'addSiteStep1' ] )
	);

	const hasStep1BeenViewed = window.localStorage.getItem(
		'Jetpack_Manage_Preference_Viewed_addSiteStep'
	);

	const shouldRenderAddSiteTourStep2 =
		( hasFinishedStep1 || hasStep1BeenViewed ) && mostRecentConnectedSite;

	// We want to reset preferences only if we're coming to this page after initiating the tour previously, but we never completed it.
	if ( hasFinishedStep1 && mostRecentConnectedSite && ! resetApplied ) {
		window.localStorage.removeItem( 'Jetpack_Manage_Preference_Viewed_addSiteStep' );
		setResetApplied( true ); // Set the state to indicate that the reset has been applied
		window.localStorage.removeItem( 'Jetpack_Manage_Preference_Reset_addSiteStep' );
	} else if (
		! resetApplied &&
		hasStep1BeenViewed &&
		! mostRecentConnectedSite &&
		window.localStorage.getItem( 'Jetpack_Manage_Preference_Reset_addSiteStep' ) === 'true'
	) {
		// Reset preferences
		dispatch(
			savePreference( JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME[ 'addSiteStep1' ], {
				dismiss: true,
			} )
		);
		dispatch(
			savePreference( JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME[ 'addSiteStep2' ], {
				dismiss: true,
			} )
		);
		setResetApplied( true ); // Set the state to indicate that the reset has been applied
	}

	const tourHTMLTarget =
		siteItems.length < 20
			? 'tr.is-most-recent-jetpack-connected-site td:first-of-type'
			: '.site-table__table th:first-of-type';

	return (
		shouldRenderAddSiteTourStep2 && (
			<GuidedTour
				className="onboarding-tours__guided-tour"
				preferenceName={ JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME[ 'addSiteStep2' ] }
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
									'Sites with jetpack installed will automatically appear in the site management view.'
								) }
							</>
						),
					},
				] }
			/>
		)
	);
}
