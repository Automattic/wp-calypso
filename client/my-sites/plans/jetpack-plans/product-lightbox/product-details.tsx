import config from '@automattic/calypso-config';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useLayoutEffect, useRef, useState } from 'react';
import FoldableCard from 'calypso/components/foldable-card';
import getIncludedProductDescriptionMap from '../product-store/utils/get-included-product-description-map';
import { SelectorProduct } from '../types';
import DescriptionList from './description-list';
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

	// Should be removed once translations are ready.
	const isEnglishLocale = config< Array< string | undefined > >( 'english_locales' ).includes(
		translate.localeSlug
	);

	return (
		<>
			{ product.productsIncluded && isEnglishLocale ? (
				<IncludedProductList
					products={ product.productsIncluded }
					descriptionMap={ getIncludedProductDescriptionMap( product.productSlug ) }
				/>
			) : (
				productDetails.map( ( { type, title, items }, index, infoList ) => (
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
						{ index !== infoList.length - 1 && <hr /> }
					</div>
				) )
			) }
		</>
	);
};

export default ProductDetails;
