import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import getSiteSlug from 'calypso/state/sites/selectors/get-site-slug';
import { StorageUsageLevels } from '../storage-usage-levels';
import ManageStorage from './manage-storage';
import siteCanUpgradeBackupStorage from './site-can-upgrade-backup-storage';
import Upsell from './upsell';

type OwnProps = {
	siteId: number;
	usageLevel: StorageUsageLevels;
	bytesUsed: number;
};

const StorageFull: React.FC = () => {
	const translate = useTranslate();
	return (
		<div className="usage-warning__storage-full">
			{ translate( 'Your Backup storage is full and new backups have been paused' ) }
		</div>
	);
};

const UsageWarning: React.FC< OwnProps > = ( { siteId, usageLevel, bytesUsed } ) => {
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) ) as string;
	const canUpgrade = useSelector( ( state ) => siteCanUpgradeBackupStorage( state, siteId ) );

	return (
		<>
			{ usageLevel === StorageUsageLevels.Full && <StorageFull /> }
			{ canUpgrade ? (
				<Upsell siteSlug={ siteSlug } usageLevel={ usageLevel } bytesUsed={ bytesUsed as number } />
			) : (
				<ManageStorage usageLevel={ usageLevel } bytesUsed={ bytesUsed } />
			) }
		</>
	);
};

export default UsageWarning;
