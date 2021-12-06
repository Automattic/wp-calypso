import { isEnabled } from '@automattic/calypso-config';
import {
	isJetpackPlan,
	isJetpackProduct,
	JETPACK_PLANS,
	JETPACK_PRODUCTS_LIST,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import QuerySites from 'calypso/components/data/query-sites';
import { getSite } from 'calypso/state/sites/selectors';
import { managePurchase } from '../paths';
import PurchaseItem from '../purchase-item';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { StoredCard } from 'calypso/my-sites/checkout/composite-checkout/types/stored-cards';

import './style.scss';

export default function PurchasesSite( {
	getManagePurchaseUrlFor = managePurchase,
	isPlaceholder,
	siteId,
	purchases,
	name,
	slug,
	cards,
	showSite = false,
}: {
	getManagePurchaseUrlFor: ( slug: string, purchaseId: number ) => string;
	isPlaceholder: boolean;
	siteId: number;
	purchases: Purchase[];
	name: string;
	slug: string;
	cards: StoredCard[];
	showSite: boolean;
} ): JSX.Element {
	const site = useSelector( ( state ) => getSite( state, siteId ) );
	if ( isPlaceholder ) {
		return <PurchaseItem isPlaceholder />;
	}

	return (
		<div className={ classNames( 'purchases-site', { 'is-placeholder': isPlaceholder } ) }>
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
						isJetpackTemporarySite={
							purchase.domain === 'siteless.jetpack.com' && isEnabled( 'jetpack/siteless-checkout' )
						}
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
