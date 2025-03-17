import { ProgressBar } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { type FC, useEffect, useState } from 'react';
import NavigationHeader from 'calypso/components/navigation-header';
import { isNotAtomicJetpack, isMigrationInProgress } from 'calypso/sites-dashboard/utils';
import { useDispatch, useSelector } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import { isRequestingSite, isRequestingSites } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import ActiveDomainsCard from './active-domains-card';
import MigrationOverview from './migration-overview';
import PlanCard from './plan-card';
import PlanCreditNotice from './plan-credit-notice';
import QuickActionsCard from './quick-actions-card';
import SiteBackupCard from './site-backup-card';
import SupportCard from './support-card';

import './style.scss';

const HostingOverview: FC = () => {
	const site = useSelector( getSelectedSite );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const isRequestingSelectedSite = useSelector(
		( state ) => !! selectedSiteId && isRequestingSite( state, selectedSiteId )
	);
	const isRequestingAllSites = useSelector( isRequestingSites );
	const [ siteRequested, setSiteRequested ] = useState( false );
	const [ wasAllSitesPending, setWasAllSitesPending ] = useState( false );

	const translate = useTranslate();
	const dispatch = useDispatch();

	useEffect( () => {
		if ( siteRequested || ! selectedSiteId ) {
			return;
		}

		const urlParams = new URLSearchParams( globalThis.location?.search ?? '' );
		if ( urlParams.get( 'refresh' ) !== 'true' ) {
			return;
		}

		// If we're already fetching the site or all sites, no need to force a refresh.
		if ( isRequestingSelectedSite || isRequestingAllSites ) {
			setSiteRequested( true );
			if ( isRequestingAllSites ) {
				setWasAllSitesPending( true );
			}
			return;
		}

		dispatch( requestSite( selectedSiteId ) );
		setSiteRequested( true );
	}, [ dispatch, isRequestingSelectedSite, isRequestingAllSites, selectedSiteId, siteRequested ] );

	if (
		selectedSiteId &&
		siteRequested &&
		( isRequestingSelectedSite || ( wasAllSitesPending && isRequestingAllSites ) )
	) {
		return (
			<div className="hosting-overview is-loading">
				<ProgressBar className="hosting-overview__progress-bar" />
			</div>
		);
	}

	if ( site ) {
		if ( isMigrationInProgress( site ) ) {
			return <MigrationOverview site={ site } />;
		}
	}

	const isJetpackNotAtomic = site && isNotAtomicJetpack( site );
	const subtitle = isJetpackNotAtomic
		? translate( 'Get a quick glance at your plans and upgrades.' )
		: translate( 'Get a quick glance at your plans, storage, and domains.' );

	return (
		<div className="hosting-overview">
			<NavigationHeader
				className="hosting-overview__navigation-header"
				title={ translate( 'Overview' ) }
				subtitle={ subtitle }
			/>
			<PlanCreditNotice />
			<PlanCard />
			<QuickActionsCard />
			<SiteBackupCard />
			<SupportCard />
			<ActiveDomainsCard />
		</div>
	);
};

export default HostingOverview;
