import {
	isJetpackPlan,
	isJetpackProduct,
	JETPACK_PLANS,
	JETPACK_PRODUCTS_LIST,
} from '@automattic/calypso-products';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import QuerySites from 'calypso/components/data/query-sites';
import { getSite } from 'calypso/state/sites/selectors';
import { managePurchase } from '../paths';
import PurchaseItem from '../purchase-item';
import { isJetpackTemporarySitePurchase } from '../utils';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { StoredCard } from 'calypso/my-sites/checkout/composite-checkout/types/stored-cards';

import './style.scss';

export default function PurchasesSite(
	props:
		| {
				isPlaceholder: true;
				siteId?: number;
		  }
		| {
				getManagePurchaseUrlFor: ( slug: string, purchaseId: number ) => string;
				isPlaceholder?: false;
				siteId: number;
				purchases: Purchase[];
				name: string;
				slug: string;
				cards: StoredCard[];
				showSite?: boolean;
		  }
): JSX.Element {
	const site = useSelector( ( state ) => getSite( state, props.siteId ?? 0 ) );
	if ( props.isPlaceholder ) {
		return <PurchaseItem isPlaceholder />;
	}

	const {
		getManagePurchaseUrlFor = managePurchase,
		siteId,
		purchases,
		name,
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
					( card ) =>
						card.stored_details_id !== purchase.payment.storedDetailsId &&
						card.meta?.find( ( meta ) => meta.meta_key === 'is_backup' )?.meta_value
				);

				return (
					<PurchaseItem
						getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
						key={ purchase.id }
						slug={ slug }
						isDisconnectedSite={ ! site }
						purchase={ purchase }
						isJetpack={ isJetpackPlan( purchase ) || isJetpackProduct( purchase ) }
						isJetpackTemporarySite={ isJetpackTemporarySitePurchase( purchase.domain ) }
						site={ site }
						showSite={ showSite }
						name={ name }
						isBackupMethodAvailable={ isBackupMethodAvailable }
					/>
				);
			} ) }
		</div>
	);
}

PurchasesSite.propTypes = {
	getManagePurchaseUrlFor: PropTypes.func,
	isPlaceholder: PropTypes.bool,
	name: PropTypes.string,
	purchases: PropTypes.array,
	showSite: PropTypes.bool,
	siteId: PropTypes.number,
	slug: PropTypes.string,
	cards: PropTypes.array,
};
