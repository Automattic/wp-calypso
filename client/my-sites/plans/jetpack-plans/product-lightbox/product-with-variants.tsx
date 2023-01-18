import { useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormLegend from 'calypso/components/forms/form-legend';
import FormRadio from 'calypso/components/forms/form-radio';
import { SelectorProduct } from '../types';
import { PRODUCT_OPTIONS_HEADER } from './constants';
import PaymentPlan from './payment-plan';

type Props = {
	product: SelectorProduct;
	variants: Array< SelectorProduct >;
	onChangeProductVariant: ( product: string ) => void;
	siteId: number | null;
	isMultiSiteIncompatible: boolean;
};

const ProductWithVariants: React.FC< Props > = ( {
	onChangeProductVariant,
	product,
	isMultiSiteIncompatible,
	siteId,
	variants,
} ) => {
	const [ selectedVariant, setSelectedVariant ] = useState( product );

	return (
		<div>
			<FormFieldset className="multiple-choice-question">
				<FormLegend className="multiple-choice-question-title">
					{ PRODUCT_OPTIONS_HEADER[ product.productSlug ] }
				</FormLegend>
			</FormFieldset>
			{ variants.map( ( variant ) => (
				<FormLabel>
					<FormRadio
						id={ variant?.productSlug }
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
						isActive={ selectedVariant?.productSlug === variant?.productSlug }
					/>
					<p />
				</FormLabel>
			) ) }
		</div>
	);
};
export default ProductWithVariants;
