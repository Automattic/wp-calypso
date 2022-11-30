import { useTranslate } from 'i18n-calypso';
import getProductIcon from '../product-store/utils/get-product-icon';
import slugToSelectorProduct from '../slug-to-selector-product';

type IncludedProductsProps = {
	products: ReadonlyArray< string >;
	descriptionMap: Record< string, string >;
};

type IncludedProductListItemProps = {
	productSlug: string;
	descriptionMap: Record< string, string >;
};

const IncludedProductListItem: React.FC< IncludedProductListItemProps > = ( {
	productSlug,
	descriptionMap,
} ) => {
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
					{ descriptionMap[ productSlug ] }
				</p>
			</div>
		</div>
	);
};

const IncludedProductList: React.FC< IncludedProductsProps > = ( { products, descriptionMap } ) => {
	const translate = useTranslate();

	return (
		<div className="product-lightbox__included-product-list">
			<h1 className="product-lightbox__included-product-list-label">
				{ translate( 'Products included:' ) }
			</h1>

			{ products.map( ( productSlug ) => (
				<IncludedProductListItem
					productSlug={ productSlug }
					descriptionMap={ descriptionMap }
					key={ productSlug }
				/>
			) ) }
		</div>
	);
};

export default IncludedProductList;
