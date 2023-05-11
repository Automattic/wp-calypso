import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useLayoutEffect, useRef, useState } from 'react';
import FoldableCard from 'calypso/components/foldable-card';
import { useIncludedProductDescriptionMap } from '../product-store/hooks/use-included-product-description-map';
import { SelectorProduct } from '../types';
import DescriptionList from './description-list';
import FAQList from './faq-list';
import IncludedProductList from './included-product-list';

type ProductDetailsProps = {
	product: SelectorProduct;
};

const ProductDetails: React.FC< ProductDetailsProps > = ( { product } ) => {
	const isMobile = useMobileBreakpoint();
	const translate = useTranslate();

	const productDetails = [
		{ type: 'includes', title: translate( 'Includes' ), items: product.whatIsIncluded },
		{ type: 'benefits', title: translate( 'Benefits' ), items: product.benefits },
	];

	const ref = useRef< HTMLDivElement | null >( null );
	const [ contentStlye, setContentStyle ] = useState( {} );

	useLayoutEffect( () => {
		const height = ref?.current?.scrollHeight || 250;
		setContentStyle( { maxHeight: `${ height }px` } );
	}, [ setContentStyle ] );

	const descriptionMap = useIncludedProductDescriptionMap( product.productSlug );

	return (
		<>
			{ product.productsIncluded ? (
				<>
					<IncludedProductList
						products={ product.productsIncluded }
						descriptionMap={ descriptionMap }
					/>
					<hr />
					<div className="product-lightbox__detail-list">
						{ isMobile ? (
							<FoldableCard
								hideSummary
								header={ translate( 'Also included:' ) }
								clickableHeader={ true }
								smooth
								contentExpandedStyle={ contentStlye }
							>
								<div ref={ ref }>
									<DescriptionList items={ product.alsoIncluded } />
								</div>
							</FoldableCard>
						) : (
							<>
								<p>{ translate( 'Also included:' ) }</p>
								<DescriptionList items={ product.alsoIncluded } />
							</>
						) }
					</div>
				</>
			) : (
				productDetails.map( ( { type, title, items } ) => (
					<div className="product-lightbox__detail-list" key={ type }>
						{ isMobile ? (
							<FoldableCard
								hideSummary
								header={ title }
								clickableHeader={ true }
								smooth
								contentExpandedStyle={ contentStlye }
							>
								<div ref={ ref }>
									<DescriptionList items={ items } />
								</div>
							</FoldableCard>
						) : (
							<>
								<p>{ title }</p>
								<DescriptionList items={ items } />
							</>
						) }
						<hr />
					</div>
				) )
			) }

			{ product.faqs && !! product.faqs.length && (
				<>
					<div className="product-lightbox__detail-list is-faq-list" key="faqs">
						{ isMobile ? (
							<FoldableCard
								hideSummary
								header={ translate( 'FAQs' ) }
								clickableHeader={ true }
								smooth
								contentExpandedStyle={ contentStlye }
							>
								<div ref={ ref }>
									<FAQList items={ product.faqs } />
								</div>
							</FoldableCard>
						) : (
							<>
								<p>{ translate( 'FAQs' ) }</p>
								<FAQList items={ product.faqs } />
							</>
						) }
					</div>
				</>
			) }
		</>
	);
};

export default ProductDetails;
