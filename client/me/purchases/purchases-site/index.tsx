import {
	isJetpackPlan,
	isJetpackProduct,
	JETPACK_PLANS,
	JETPACK_PRODUCTS_LIST,
} from '@automattic/calypso-products';
import AsyncLoad from 'calypso/components/async-load';
import QuerySites from 'calypso/components/data/query-sites';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import { managePurchase } from '../paths';
import PurchaseItem from '../purchase-item';
import type { StoredPaymentMethod } from 'calypso/lib/checkout/payment-methods';
import type { Purchase, GetManagePurchaseUrlFor } from 'calypso/lib/purchases/types';

import './style.scss';

export default function PurchasesSite(
	props:
		| {
				isPlaceholder: true;
				siteId?: number;
		  }
		| {
				getManagePurchaseUrlFor?: GetManagePurchaseUrlFor;
				isPlaceholder?: false;
				siteId: number;
				purchases: Purchase[];
				slug: string;
				cards: StoredPaymentMethod[];
				showSite?: boolean;
		  }
) {
	const site = useSelector( ( state ) => getSite( state, props.siteId ?? 0 ) );
	if ( props.isPlaceholder ) {
		return <PurchaseItem isPlaceholder />;
	}

	const {
		getManagePurchaseUrlFor = managePurchase,
		siteId,
		purchases,
		slug,
		cards,
		showSite = false,
	} = props;

	return (
		<div className="purchases-site">
			<QuerySites siteId={ siteId } />

			<AsyncLoad
				require="calypso/blocks/product-plan-overlap-notices"
				placeholder={ null }
				plans={ JETPACK_PLANS }
				products={ JETPACK_PRODUCTS_LIST }
				siteId={ siteId }
			/>

			{ purchases.map( ( purchase ) => {
				const isBackupMethodAvailable = cards.some(
					( card ) => card.stored_details_id !== purchase.payment.storedDetailsId && card.is_backup
				);

				return (
					<PurchaseItem
						getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
						key={ purchase.id }
						slug={ slug }
						isDisconnectedSite={ ! site }
						purchase={ purchase }
						isJetpack={ isJetpackPlan( purchase ) || isJetpackProduct( purchase ) }
						site={ site }
						showSite={ showSite }
						isBackupMethodAvailable={ isBackupMethodAvailable }
					/>
				);
			} ) }
		</div>
	);
}
