import ProductLightbox from '../../product-lightbox';
import { useItemLightbox } from '../hooks/use-item-lightbox';
import { BundlesList } from './bundles-list';
import { ProductsList } from './products-list';
import type { ItemsListProps, ProductsListProps, ViewType } from '../types';

import './style.scss';

const components: Record< ViewType, React.ComponentType< ProductsListProps > > = {
	products: ProductsList,
	bundles: BundlesList,
};

export const ItemsList: React.FC< ItemsListProps > = ( {
	createCheckoutURL,
	currentView,
	duration,
	onClickPurchase,
	siteId,
} ) => {
	const { currentItem, clearCurrentItem, onClickMoreInfoFactory } = useItemLightbox();
	const Component = components[ currentView ];

	if ( ! Component ) {
		return null;
	}

	return (
		<div className="jetpack-product-store__items-list">
			{ currentItem && (
				<ProductLightbox
					product={ currentItem }
					isVisible={ !! currentItem }
					onClose={ clearCurrentItem }
				/>
			) }

			<Component
				duration={ duration }
				siteId={ siteId }
				createCheckoutURL={ createCheckoutURL }
				onClickPurchase={ onClickPurchase }
				onClickMoreInfoFactory={ onClickMoreInfoFactory }
			/>
		</div>
	);
};
