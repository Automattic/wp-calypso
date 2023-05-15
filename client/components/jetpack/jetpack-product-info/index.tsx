import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useIncludedProductDescriptionMap } from 'calypso/my-sites/plans/jetpack-plans/product-store/hooks/use-included-product-description-map';
import getProductIcon from 'calypso/my-sites/plans/jetpack-plans/product-store/utils/get-product-icon';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import JetpackProductInfoFAQList from './faq-list';
import JetpackProductInfoProductList from './product-list';
import JetpackProductInfoRecommendationTags from './recommendation-tags';
import JetpackProductInfoRegularList from './regular-list';
import JetpackProductInfoSection from './section';

import './style.scss';

type JetpackProductInfoProps = {
	title: string;
	product: SelectorProduct;
	full?: boolean;
};

const JetpackProductInfo: FunctionComponent< JetpackProductInfoProps > = ( {
	title,
	product,
	full,
} ) => {
	const { description, recommendedFor, whatIsIncluded, benefits, faqs, productSlug } = product;

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

			{ full && recommendedFor && <JetpackProductInfoRecommendationTags tags={ recommendedFor } /> }

			{ product.productsIncluded ? (
				<JetpackProductInfoProductList
					products={ product.productsIncluded }
					descriptionMap={ descriptionMap }
				/>
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
