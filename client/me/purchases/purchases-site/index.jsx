import { isEnabled } from '@automattic/calypso-config';
import {
	isJetpackPlan,
	isJetpackProduct,
	JETPACK_PLANS,
	JETPACK_PRODUCTS_LIST,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import QuerySites from 'calypso/components/data/query-sites';
import { getSite } from 'calypso/state/sites/selectors';
import { managePurchase } from '../paths';
import PurchaseItem from '../purchase-item';

import './style.scss';

const PurchasesSite = ( {
	getManagePurchaseUrlFor = managePurchase,
	isPlaceholder,
	site,
	siteId,
	purchases,
	name,
	slug,
	cards,
	showSite = false,
} ) => {
	if ( isPlaceholder ) {
		return <PurchaseItem isPlaceholder />;
	}
	const isBackupMethodAvailable = cards.some(
		( card ) => !! card.meta?.find( ( meta ) => meta.meta_key === 'is_backup' )?.meta_value
	);

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

			{ purchases.map( ( purchase ) => (
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
			) ) }
		</div>
	);
};

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

export default connect( ( state, { siteId } ) => ( {
	site: getSite( state, siteId ),
} ) )( PurchasesSite );
