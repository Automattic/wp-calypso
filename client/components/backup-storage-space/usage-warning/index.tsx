import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { StorageUsageLevels } from '../storage-usage-levels';
import Upsell from './upsell';

type OwnProps = {
	siteSlug: string;
	usageLevel: StorageUsageLevels;
	bytesUsed: number;
};

const UsageWarning: React.FC< OwnProps > = ( { usageLevel, bytesUsed, siteSlug } ) => {
	return (
		<Upsell
			usageLevel={ usageLevel }
			bytesUsed={ bytesUsed as number }
			href={ isJetpackCloud() ? `/pricing/backup/${ siteSlug }` : `/plans/${ siteSlug }` }
		/>
	);
};

export default UsageWarning;
