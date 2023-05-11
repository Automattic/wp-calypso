import { useTranslate } from 'i18n-calypso';
import getProductIcon from '../product-store/utils/get-product-icon';
import slugToSelectorProduct from '../slug-to-selector-product';
import { ProductDescription } from '../types';

type IncludedProductsProps = {
	products: ReadonlyArray< string >;
	descriptionMap: Record< string, ProductDescription >;
};

type IncludedProductListItemProps = {
	productSlug: string;
	descriptionMap: Record< string, ProductDescription >;
};

const IncludedProductListItem: React.FC< IncludedProductListItemProps > = ( {
	productSlug,
	descriptionMap,
} ) => {
	const product = slugToSelectorProduct( productSlug );
	return (
		<>
			<div className="product-lightbox__included-product-list-item">
				<div className="product-lightbox__included-product-list-item-icon">
					<img alt="" src={ getProductIcon( { productSlug } ) } />
				</div>

				<div className="product-lightbox__included-product-list-item-content">
					<div className="product-lightbox__included-product-list-item-header">
						<h3 className="product-lightbox__included-product-list-item-title">
							{ product?.shortName }
						</h3>
						{ descriptionMap[ productSlug ]?.calloutText && (
							<span className="product-lightbox__included-product-list-item-callout">
								{ descriptionMap[ productSlug ].calloutText }
							</span>
						) }
					</div>

					<p className="product-lightbox__included-product-list-item-description">
						{ descriptionMap[ productSlug ].value }
					</p>
				</div>
			</div>
			<p className="product-lightbox__included-product-list-item-description--mobile">
				{ descriptionMap[ productSlug ].value }
			</p>
		</>
	);
};

const IncludedProductList: React.FC< IncludedProductsProps > = ( { products, descriptionMap } ) => {
	const translate = useTranslate();

	return (
		<div className="product-lightbox__included-product-list">
			<h3 className="product-lightbox__included-product-list-label">
				{ translate( 'Products included:' ) }
			</h3>

			<ul>
				{ products.map( ( productSlug ) => (
					<li key={ productSlug }>
						<IncludedProductListItem
							productSlug={ productSlug }
							descriptionMap={ descriptionMap }
						/>
					</li>
				) ) }
			</ul>
		</div>
	);
};

export default IncludedProductList;
