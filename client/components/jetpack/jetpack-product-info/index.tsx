import clsx from 'clsx';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { FunctionComponent, ReactNode } from 'react';
import { useIncludedProductDescriptionMap } from 'calypso/components/jetpack/jetpack-product-info/hooks/use-included-product-description-map';
import isWooCommerceProduct from 'calypso/jetpack-cloud/sections/partner-portal/lib/is-woocommerce-product';
import { PricingBreakdown } from 'calypso/my-sites/plans/jetpack-plans/product-store/pricing-breakdown';
import getProductIcon from 'calypso/my-sites/plans/jetpack-plans/product-store/utils/get-product-icon';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import JetpackProductInfoComingSoonList from './coming-soon-list';
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
	title: TranslateResult;
	customDescription?: ReactNode;
};

const JetpackProductInfo: FunctionComponent< JetpackProductInfoProps > = ( {
	full,
	product,
	showPricingBreakdown,
	siteId = null,
	title,
	customDescription,
} ) => {
	const {
		alsoIncluded,
		benefits,
		benefitsComingSoon,
		iconSlug,
		lightboxDescription,
		faqs,
		disclaimer,
		productSlug,
		recommendedFor,
		whatIsIncluded,
		whatIsIncludedComingSoon,
	} = product;

	const translate = useTranslate();
	const icon = getProductIcon( { productSlug } );
	const isWooCommerce = isWooCommerceProduct( productSlug );
	const iconStyles = clsx( {
		'jetpack-product-info__product-icon': true,
		'jetpack-product-info__product-icon-woocommerce': isWooCommerce,
		[ iconSlug ]: !! iconSlug,
	} );

	const descriptionMap = useIncludedProductDescriptionMap( product.productSlug );

	return (
		<div className={ clsx( 'jetpack-product-info', { 'is-woocommerce-product': isWooCommerce } ) }>
			<div className="jetpack-product-info__header">
				<div className={ iconStyles }>
					<img alt="" src={ icon } />
				</div>
				<h2>{ title }</h2>
			</div>
			<div className="jetpack-product-info__description">{ lightboxDescription }</div>

			{ showPricingBreakdown && product.productsIncluded && (
				<PricingBreakdown
					includedProductSlugs={ product.productsIncluded }
					product={ product }
					showBreakdownHeading
					siteId={ siteId }
				/>
			) }

			{ full && recommendedFor && <JetpackProductInfoRecommendationTags tags={ recommendedFor } /> }

			{ customDescription }

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
							{ !! whatIsIncludedComingSoon?.length && (
								<JetpackProductInfoComingSoonList items={ whatIsIncludedComingSoon } />
							) }
							<JetpackProductInfoRegularList items={ whatIsIncluded } />
						</JetpackProductInfoSection>
					) }

					{ benefits?.length && (
						<JetpackProductInfoSection title={ translate( 'Benefits' ) }>
							{ !! benefitsComingSoon?.length && (
								<JetpackProductInfoComingSoonList items={ benefitsComingSoon } />
							) }
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

			{ disclaimer && (
				<JetpackProductInfoSection alwaysExpanded>
					<span className="jetpack-product-info__disclaimer-text">{ disclaimer }</span>
				</JetpackProductInfoSection>
			) }
		</div>
	);
};

export default JetpackProductInfo;
