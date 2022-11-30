import { useTranslate } from 'i18n-calypso';
import getProductIcon from '../product-store/utils/get-product-icon';
import slugToSelectorProduct from '../slug-to-selector-product';

type IncludedProductsProps = {
	products: ReadonlyArray< string >;
};

type IncludedProductListItemProps = {
	productSlug: string;
};

const IncludedProductListItem: React.FC< IncludedProductListItemProps > = ( { productSlug } ) => {
	const product = slugToSelectorProduct( productSlug );
	return (
		<div className="product-lightbox__included-product-list-item">
			<div className="product-lightbox__included-product-list-item-icon">
				<img alt="" src={ getProductIcon( { productSlug, light: true } ) } />
			</div>

			<div className="product-lightbox__included-product-list-item-content">
				<h1 className="product-lightbox__included-product-list-item-title">
					{ product?.shortName }
				</h1>

				<p className="product-lightbox__included-product-list-item-description">
					{ product?.shortDescription }
				</p>
			</div>
		</div>
	);
};

const IncludedProductList: React.FC< IncludedProductsProps > = ( { products } ) => {
	const translate = useTranslate();

	return (
		<div className="product-lightbox__included-product-list">
			<h1 className="product-lightbox__included-product-list-label">
				{ translate( 'Products included:' ) }
			</h1>

			{ products.map( ( productSlug ) => (
				<IncludedProductListItem productSlug={ productSlug } key={ productSlug } />
			) ) }
		</div>
	);
};

export default IncludedProductList;
