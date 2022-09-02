import { BundlesList } from '../bundle-list';
import { ProductsList } from '../products-list';
import type { ItemsListProps } from '../types';

import './style.scss';

export const ItemsList: React.FC< ItemsListProps > = ( {
	createCheckoutURL,
	currentView,
	duration,
	onClickPurchase,
	siteId,
} ) => {
	return (
		<div className="jetpack-product-store__items-list">
			{ currentView === 'products' && (
				<ProductsList
					duration={ duration }
					siteId={ siteId }
					createCheckoutURL={ createCheckoutURL }
					onClickPurchase={ onClickPurchase }
				/>
			) }
			{ currentView === 'bundles' && (
				<BundlesList
					duration={ duration }
					siteId={ siteId }
					createCheckoutURL={ createCheckoutURL }
					onClickPurchase={ onClickPurchase }
				/>
			) }
		</div>
	);
};
