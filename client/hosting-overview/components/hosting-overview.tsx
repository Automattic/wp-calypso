import { WPCOM_FEATURES_ATOMIC } from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { FC } from 'react';
import NavigationHeader from 'calypso/components/navigation-header';
import ActiveDomainsCard from 'calypso/hosting-overview/components/active-domains-card';
import PlanCard from 'calypso/hosting-overview/components/plan-card';
import QuickActionsCard from 'calypso/hosting-overview/components/quick-actions-card';
import SiteBackupCard from 'calypso/my-sites/hosting/site-backup-card';
import SupportCard from 'calypso/my-sites/hosting/support-card';
import { isNotAtomicJetpack } from 'calypso/sites-dashboard/utils';
import { useSelector } from 'calypso/state';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const HostingOverview: FC = () => {
	const site = useSelector( getSelectedSite );
	const isJetpackNotAtomic = site && isNotAtomicJetpack( site );
	const isSiteAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, site?.ID ?? null ) );
	const hasAtomicFeature = useSelector( ( state ) =>
		siteHasFeature( state, site?.ID ?? null, WPCOM_FEATURES_ATOMIC )
	);

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
			<PlanCard />
			<QuickActionsCard />
			<SiteBackupCard disabled={ ! hasAtomicFeature || ! isSiteAtomic } />
			<SupportCard />
			<ActiveDomainsCard />
		</div>
	);
};

export default HostingOverview;
