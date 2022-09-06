import ProductLightbox from '../../product-lightbox';
import { BundlesList } from '../bundle-list';
import { useItemLightbox } from '../hooks/use-item-lightbox';
import { ProductsList } from '../product-list';
import type { ItemsListProps } from '../types';

import './style.scss';

export const ItemsList: React.FC< ItemsListProps > = ( {
	createCheckoutURL,
	currentView,
	duration,
	onClickPurchase,
	siteId,
} ) => {
	const { currentItem, setCurrentItem, clickMoreHandlerFactory } = useItemLightbox();

	return (
		<div className="jetpack-product-store__items-list">
			{ currentItem && (
				<ProductLightbox
					product={ currentItem }
					isVisible={ !! currentItem }
					onClose={ () => {
						setCurrentItem( null );
					} }
				/>
			) }

			{ currentView === 'products' && (
				<ProductsList
					duration={ duration }
					siteId={ siteId }
					createCheckoutURL={ createCheckoutURL }
					onClickPurchase={ onClickPurchase }
					clickMoreHandlerFactory={ clickMoreHandlerFactory }
				/>
			) }
			{ currentView === 'bundles' && (
				<BundlesList
					duration={ duration }
					siteId={ siteId }
					createCheckoutURL={ createCheckoutURL }
					onClickPurchase={ onClickPurchase }
					clickMoreHandlerFactory={ clickMoreHandlerFactory }
				/>
			) }
		</div>
	);
};
