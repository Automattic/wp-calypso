import { TranslateResult, useTranslate } from 'i18n-calypso';
import getProductIcon from 'calypso/my-sites/plans/jetpack-plans/product-store/utils/get-product-icon';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';

type JetpackProductInfoProductListProps = {
	products: ReadonlyArray< string >;
	descriptionMap: Record< string, TranslateResult >;
};

type JetpackProductInfoProductListItemProps = {
	productSlug: string;
	descriptionMap: Record< string, TranslateResult >;
};

const JetpackProductInfoProductListItem: React.FC< JetpackProductInfoProductListItemProps > = ( {
	productSlug,
	descriptionMap,
} ) => {
	const product = slugToSelectorProduct( productSlug );
	return (
		<div className="jetpack-product-info__product-list-item">
			<div className="jetpack-product-info__product-list-item-icon">
				<img alt="" src={ getProductIcon( { productSlug } ) } />
			</div>

			<div className="jetpack-product-info__product-list-item-content">
				<h1 className="jetpack-product-info__product-list-item-title">{ product?.shortName }</h1>

				<p className="jetpack-product-info__product-list-item-description">
					{ descriptionMap[ productSlug ] }
				</p>
			</div>
		</div>
	);
};

const JetpackProductInfoProductList: React.FC< JetpackProductInfoProductListProps > = ( {
	products,
	descriptionMap,
} ) => {
	const translate = useTranslate();

	return (
		<div className="jetpack-product-info__product-list">
			<h3 className="jetpack-product-info__product-list-label">
				{ translate( 'Products included:' ) }
			</h3>

			<ul>
				{ products.map( ( productSlug ) => (
					<li key={ productSlug }>
						<JetpackProductInfoProductListItem
							productSlug={ productSlug }
							descriptionMap={ descriptionMap }
						/>
					</li>
				) ) }
			</ul>
		</div>
	);
};

export default JetpackProductInfoProductList;
