import NotAvailableBadge from '../not-available-badge';
import { RestrictionType } from '../types';
import UpgradeBadge from '../upgrade-badge';

type Props = {
	restriction?: RestrictionType;
};

export default function FeatureRestrictionBadge( { restriction }: Props ) {
	if ( ! restriction ) {
		return null;
	}

	if ( restriction === 'upgrade_required' ) {
		return <UpgradeBadge />;
	}

	if ( [ 'free_site_selected', 'atomic_site_selected' ].includes( restriction ) ) {
		return <NotAvailableBadge restriction={ restriction } />;
	}
}
