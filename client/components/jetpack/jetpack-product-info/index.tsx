import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, ReactChild } from 'react';
import { useIncludedProductDescriptionMap } from 'calypso/my-sites/plans/jetpack-plans/product-store/hooks/use-included-product-description-map';
import { PricingBreakdown } from 'calypso/my-sites/plans/jetpack-plans/product-store/pricing-breakdown';
import getProductIcon from 'calypso/my-sites/plans/jetpack-plans/product-store/utils/get-product-icon';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import JetpackProductInfoFAQList from './faq-list';
import JetpackProductInfoProductList from './product-list';
import JetpackProductInfoRecommendationTags from './recommendation-tags';
import JetpackProductInfoRegularList from './regular-list';
import JetpackProductInfoSection from './section';

import './style.scss';

type JetpackProductInfoProps = {
	full?: boolean;
	product: SelectorProduct;
	showPricingBreakdown?: boolean;
	siteId?: number;
	title: string | ReactChild;
};

const JetpackProductInfo: FunctionComponent< JetpackProductInfoProps > = ( {
	full,
	product,
	showPricingBreakdown,
	siteId = null,
	title,
} ) => {
	const { description, recommendedFor, whatIsIncluded, alsoIncluded, benefits, faqs, productSlug } =
		product;

	const translate = useTranslate();
	const icon = getProductIcon( { productSlug } );

	const descriptionMap = useIncludedProductDescriptionMap( product.productSlug );

	return (
		<div className="jetpack-product-info">
			<div className="jetpack-product-info__header">
				<div className="jetpack-product-info__product-icon">
					<img alt="" src={ icon } />
				</div>
				<h2>{ title }</h2>
			</div>
			<div className="jetpack-product-info__description">{ description }</div>

			{ showPricingBreakdown && product.productsIncluded && (
				<PricingBreakdown
					includedProductSlugs={ product.productsIncluded }
					product={ product }
					showBreakdownHeading
					siteId={ siteId }
				/>
			) }

			{ full && recommendedFor && <JetpackProductInfoRecommendationTags tags={ recommendedFor } /> }

			{ product.productsIncluded ? (
				<>
					<JetpackProductInfoProductList
						products={ product.productsIncluded }
						descriptionMap={ descriptionMap }
					/>

					{ alsoIncluded?.length && (
						<JetpackProductInfoSection title={ translate( 'Also included:' ) }>
							<JetpackProductInfoRegularList items={ alsoIncluded } />
						</JetpackProductInfoSection>
					) }
				</>
			) : (
				<>
					{ whatIsIncluded?.length && (
						<JetpackProductInfoSection title={ translate( 'Includes' ) }>
							<JetpackProductInfoRegularList items={ whatIsIncluded } />
						</JetpackProductInfoSection>
					) }

					{ benefits?.length && (
						<JetpackProductInfoSection title={ translate( 'Benefits' ) }>
							<JetpackProductInfoRegularList items={ benefits } />
						</JetpackProductInfoSection>
					) }
				</>
			) }

			{ faqs?.length && (
				<JetpackProductInfoSection title={ translate( 'FAQs' ) }>
					<JetpackProductInfoFAQList items={ faqs } />
				</JetpackProductInfoSection>
			) }
		</div>
	);
};

export default JetpackProductInfo;
