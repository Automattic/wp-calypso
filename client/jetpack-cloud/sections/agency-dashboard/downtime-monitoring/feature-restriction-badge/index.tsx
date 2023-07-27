import NotAvailableBadge from '../not-available-badge';
import { RestrictionType } from '../types';
import UpgradeBadge from '../upgrade-badge';

type Props = {
	restriction?: RestrictionType;
};

export default function FeatureRestrictionBadge( { restriction }: Props ) {
	if ( restriction === 'upgrade_required' ) {
		return <UpgradeBadge />;
	}

	if ( restriction === 'free_site_selected' ) {
		return <NotAvailableBadge />;
	}

	return null;
}
