import ProductLightbox from '../../product-lightbox';
import { useProductLightbox } from '../hooks/use-product-lightbox';
import { ItemToDisplayProps as ItemsListProps } from '../types';
import { ProductsList } from './products-list';

import './style.scss';

export const ItemsList: React.FC< ItemsListProps > = ( { duration, siteId } ) => {
	const { currentProduct, setCurrentProduct, onClickMoreInfoFactory } = useProductLightbox();

	return (
		<div className="jetpack-product-store__items-list">
			{ currentProduct && (
				<ProductLightbox
					siteId={ siteId }
					duration={ duration }
					product={ currentProduct }
					isVisible={ !! currentProduct }
					onClose={ () => setCurrentProduct( null ) }
				/>
			) }

			<ProductsList
				siteId={ siteId }
				onClickMoreInfoFactory={ onClickMoreInfoFactory }
				duration={ duration }
			/>
		</div>
	);
};
