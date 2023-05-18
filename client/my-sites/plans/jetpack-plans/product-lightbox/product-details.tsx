import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import FoldableCard from 'calypso/components/foldable-card';
import { useIncludedProductDescriptionMap } from '../product-store/hooks/use-included-product-description-map';
import { SelectorProduct } from '../types';
import DescriptionList from './description-list';
import FAQList from './faq-list';
import IncludedProductList from './included-product-list';

type ProductDetailsProps = {
	product: SelectorProduct;
};

type ProductDetailsListProps = {
	title: string;
	detailsList: JSX.Element;
};

const ProductDetailsList: React.FC< ProductDetailsListProps > = ( { title, detailsList } ) => {
	const isMobile = useMobileBreakpoint();

	if ( isMobile ) {
		return (
			<FoldableCard
				hideSummary
				header={ title }
				clickableHeader={ true }
				smooth
				contentExpandedStyle={ { maxHeight: 'fit-content' } }
			>
				<div>{ detailsList }</div>
			</FoldableCard>
		);
	}

	return (
		<>
			<p>{ title }</p>
			{ detailsList }
		</>
	);
};

const ProductDetails: React.FC< ProductDetailsProps > = ( { product } ) => {
	const translate = useTranslate();

	const productDetails = [
		{
			type: 'includes',
			title: translate( 'Includes' ),
			items: product.whatIsIncluded,
			comingSoon: product.whatIsIncludedComingSoon,
		},
		{
			type: 'benefits',
			title: translate( 'Benefits' ),
			items: product.benefits,
			comingSoon: product.benefitsComingSoon,
		},
	];

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
						<ProductDetailsList
							title={ translate( 'Also included:' ) }
							detailsList={ <DescriptionList items={ product.alsoIncluded } /> }
						/>
					</div>
				</>
			) : (
				productDetails.map( ( { type, title, items, comingSoon } ) => (
					<div className="product-lightbox__detail-list" key={ type }>
						<ProductDetailsList
							title={ title }
							detailsList={ <DescriptionList items={ items } comingSoon={ comingSoon } /> }
						/>
						<hr />
					</div>
				) )
			) }

			{ product.faqs && !! product.faqs.length && (
				<>
					<div className="product-lightbox__detail-list is-faq-list" key="faqs">
						<ProductDetailsList
							title={ translate( 'FAQs' ) }
							detailsList={ <FAQList items={ product.faqs } /> }
						/>
					</div>
				</>
			) }
		</>
	);
};

export default ProductDetails;
