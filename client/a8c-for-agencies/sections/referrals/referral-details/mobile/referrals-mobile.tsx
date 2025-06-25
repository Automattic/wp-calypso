import { useTranslate } from 'i18n-calypso';
import {
	ListItemCards,
	ListItemCard,
	ListItemCardContent,
	ListItemCardActions,
	type Action,
} from 'calypso/a8c-for-agencies/components/list-item-cards';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import ReferralProducts from '../components/referral-products';
import ReferralStatus from '../components/referral-status';
import type { ReferralAPIResponse } from '../../types';

import './style.scss';

const ClientReferralsMobile = ( {
	referrals,
	isFetchingProducts,
	productsData,
	actions,
}: {
	referrals: ReferralAPIResponse[];
	isFetchingProducts: boolean;
	productsData: APIProductFamilyProduct[] | undefined;
	actions: Action[];
} ) => {
	const translate = useTranslate();
	return (
		<ListItemCards>
			{ referrals.map( ( referral ) => (
				<ListItemCard key={ `${ referral.client.id }-${ referral.id }` }>
					<ListItemCardActions actions={ actions } item={ referral } />
					<ListItemCardContent title={ translate( 'Products' ) }>
						<ReferralProducts
							products={ referral.products }
							isFetchingProducts={ isFetchingProducts }
							productsData={ productsData }
						/>
					</ListItemCardContent>
					<ListItemCardContent title={ translate( 'Status' ) }>
						<ReferralStatus status={ referral.status } />
					</ListItemCardContent>
				</ListItemCard>
			) ) }
		</ListItemCards>
	);
};

export default ClientReferralsMobile;
