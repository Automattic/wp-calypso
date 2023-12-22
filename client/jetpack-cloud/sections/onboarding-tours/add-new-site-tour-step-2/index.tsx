import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import GuidedTour from 'calypso/jetpack-cloud/components/guided-tour';
import { useSelector } from 'calypso/state';
import { items } from 'calypso/state/notices/reducer';
import { getPreference } from 'calypso/state/preferences/selectors';
import SitesOverviewContext from '../../agency-dashboard/sites-overview/context';

export default function AddNewSiteTourStep2() {
	const translate = useTranslate();
	const { mostRecentConnectedSite } = useContext( SitesOverviewContext );
	const hasAddNewSiteTourPreference = useSelector( ( state ) =>
		getPreference( state, 'jetpack-cloud-site-dashboard-add-new-site-tour-step-1' )
	);
	const shouldRenderAddSiteTourStep2 = hasAddNewSiteTourPreference && mostRecentConnectedSite;

	const tourHTMLTarget =
		items.length < 20
			? 'tr.is-most-recent-jetpack-connected-site td:first-of-type'
			: '.site-table__table th:first-of-type';

	return (
		shouldRenderAddSiteTourStep2 && (
			<GuidedTour
				className="jetpack-cloud-site-dashboard-new-site-added__guided-tour"
				preferenceName="jetpack-cloud-site-dashboard-add-new-site-tour-step-2"
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
						redirectOnButtonClick: '/overview',
					},
				] }
			/>
		)
	);
}
