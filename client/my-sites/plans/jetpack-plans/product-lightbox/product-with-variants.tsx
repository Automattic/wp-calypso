import { JETPACK_RELATED_PRODUCTS_MAP } from '@automattic/calypso-products';
import { useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormLegend from 'calypso/components/forms/form-legend';
import FormRadio from 'calypso/components/forms/form-radio';
import slugToSelectorProduct from '../slug-to-selector-product';
import { SelectorProduct } from '../types';
import { PRODUCT_OPTIONS_HEADER } from './constants';
import PaymentPlan from './payment-plan';

type Props = {
	product: SelectorProduct;
	onChangeProductVariant: ( product: string ) => void;
	siteId: number | null;
	isMultiSiteIncompatible: boolean;
};

const ProductWithVariants: React.FC< Props > = ( {
	onChangeProductVariant,
	product,
	isMultiSiteIncompatible,
	siteId,
} ) => {
	const [ selectedVariant, setSelectedVariant ] = useState( product );
	const variants = JETPACK_RELATED_PRODUCTS_MAP[ product.productSlug ].map( ( slug ) => {
		return slugToSelectorProduct( slug ) as SelectorProduct;
	} );

	return (
		<div>
			<FormFieldset className="multiple-choice-question">
				<FormLegend className="multiple-choice-question-title">
					{ PRODUCT_OPTIONS_HEADER[ product.productSlug ] }
				</FormLegend>
			</FormFieldset>
			{ variants.map( ( variant ) => (
				<FormLabel key={ variant.productSlug }>
					<FormRadio
						value={ variant }
						onChange={ () => {
							onChangeProductVariant( variant.productSlug );
							setSelectedVariant( variant );
						} }
						checked={ selectedVariant.productSlug === variant.productSlug }
						className="jetpack-products-with-variants"
						label={ null }
					/>
					<PaymentPlan
						isMultiSiteIncompatible={ isMultiSiteIncompatible }
						siteId={ siteId }
						product={ variant }
						showPlansOneBelowTheOther={ true }
						isActive={ selectedVariant?.productSlug === variant.productSlug }
					/>
					<p />
				</FormLabel>
			) ) }
		</div>
	);
};
export default ProductWithVariants;
