import { Notice } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import NavigationHeader from 'calypso/components/navigation-header';
import { isNotAtomicJetpack, isMigrationInProgress } from 'calypso/sites-dashboard/utils';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ActiveDomainsCard from './active-domains-card';
import MigrationOverview from './migration-overview';
import PlanCard from './plan-card';
import QuickActionsCard from './quick-actions-card';
import SiteBackupCard from './site-backup-card';
import SupportCard from './support-card';

import './style.scss';

const HostingOverview: FC = () => {
	const site = useSelector( getSelectedSite );
	const translate = useTranslate();

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
			<Notice
				className="hosting-overview__domain-to-plan-credit-notice"
				status="info"
				onRemove={ () => {} }
			>
				{ translate(
					// TODO: Retrieve value of credit to programmatically insert into this message.
					'You have $X in upgrade credits for a price reduction in your plan upgrade.'
				) }
			</Notice>
			<NavigationHeader
				className="hosting-overview__navigation-header"
				title={ translate( 'Overview' ) }
				subtitle={ subtitle }
			/>
			<PlanCard />
			<QuickActionsCard />
			<SiteBackupCard />
			<SupportCard />
			<ActiveDomainsCard />
		</div>
	);
};

export default HostingOverview;
