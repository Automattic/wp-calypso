import { Gridicon } from '@automattic/components';
import { ReferralPurchase } from '../../types';

type Props = {
	purchase: ReferralPurchase;
};

const DateAssigned = ( { purchase }: Props ) => {
	return purchase.license?.attached_at ? (
		new Date( purchase.license.attached_at ).toLocaleDateString()
	) : (
		<Gridicon icon="minus" />
	);
};

export default DateAssigned;
