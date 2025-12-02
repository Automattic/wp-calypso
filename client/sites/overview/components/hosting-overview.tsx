import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import NavigationHeader from 'calypso/components/navigation-header';
import { isMigrationInProgress } from 'calypso/data/site-migration';
import { isNotAtomicJetpack } from 'calypso/sites-dashboard/utils';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ActiveDomainsCard from './active-domains-card';
import MigrationOverview from './migration-overview';
import { MigrationSSHComplete } from './migration-overview/components/migration-ssh-complete';
import { MigrationSSHFailed } from './migration-overview/components/migration-ssh-failed';
import PlanCard from './plan-card';
import PlanCreditNotice from './plan-credit-notice';
import QuickActionsCard from './quick-actions-card';
import SiteBackupCard from './site-backup-card';
import SupportCard from './support-card';

import './style.scss';

const HostingOverview: FC = () => {
	const site = useSelector( getSelectedSite );
	const translate = useTranslate();

	if ( site ) {
		const queryParams = new URLSearchParams( window.location.search );
		const sshMigration = queryParams.get( 'ssh-migration' );
		if ( sshMigration === 'completed' ) {
			return <MigrationSSHComplete site={ site } />;
		}
		if ( sshMigration === 'failed' ) {
			return <MigrationSSHFailed />;
		}

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
			<ActiveDomainsCard />
			<SiteBackupCard />
			<SupportCard />
		</div>
	);
};

export default HostingOverview;
