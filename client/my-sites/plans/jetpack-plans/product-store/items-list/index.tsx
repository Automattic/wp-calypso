import ProductLightbox from '../../product-lightbox';
import { useProductLightbox } from '../hooks/use-product-lightbox';
import { BundlesList } from './bundles-list';
import { ProductsList } from './products-list';
import type { ItemsListProps, ProductsListProps, ViewType } from '../types';

import './style.scss';

const components: Record< ViewType, React.ComponentType< ProductsListProps > > = {
	products: ProductsList,
	bundles: BundlesList,
};

export const ItemsList: React.FC< ItemsListProps > = ( { currentView, duration, siteId } ) => {
	const { currentProduct, setCurrentProduct, onClickMoreInfoFactory } = useProductLightbox();
	const Component = components[ currentView ];

	if ( ! Component ) {
		return null;
	}

	return (
		<div className="jetpack-product-store__items-list">
			{ currentProduct && (
				<ProductLightbox
					siteId={ siteId }
					duration={ duration }
					product={ currentProduct }
					isVisible={ !! currentProduct }
					onClose={ () => setCurrentProduct( null ) }
					onChangeProduct={ setCurrentProduct }
				/>
			) }

			<Component
				siteId={ siteId }
				onClickMoreInfoFactory={ onClickMoreInfoFactory }
				duration={ duration }
			/>
		</div>
	);
};
