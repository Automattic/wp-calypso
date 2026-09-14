import EmptyValueIndicator from 'calypso/a8c-for-agencies/components/empty-value-indicator';
import { ReferralPurchase } from '../../types';

type Props = {
	purchase: ReferralPurchase;
};

const DateAssigned = ( { purchase }: Props ) => {
	return purchase.license?.attached_at ? (
		new Date( purchase.license.attached_at ).toLocaleDateString()
	) : (
		<EmptyValueIndicator />
	);
};

export default DateAssigned;
