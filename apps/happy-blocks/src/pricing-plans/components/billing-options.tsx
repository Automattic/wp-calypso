import { createInterpolateElement } from '@wordpress/element';
import { FunctionComponent } from 'react';
import { PricingPlanBilling } from '../types';

const Promo: FunctionComponent = ( { children } ) => (
	<span className="hb-pricing-plans-embed__promo">({ children })</span>
);

interface Props {
	billings: PricingPlanBilling[];
	value: string;
	onChange: ( value: string ) => void;
}

const BillingOptions: FunctionComponent< Props > = ( { billings, value, onChange } ) => {
	return (
		<fieldset className="hb-pricing-plans-embed__billing-options">
			{ billings.map( ( planBilling ) => (
				<div key={ planBilling.planSlug }>
					<label className="hb-pricing-plans-embed__billing-option-label">
						<input
							className="hb-pricing-plans-embed__billing-option-input"
							type="radio"
							name="price"
							value={ planBilling.planSlug }
							checked={ planBilling.planSlug === value }
							onChange={ () => onChange( planBilling.planSlug ) }
						/>
						{ createInterpolateElement( planBilling.label, {
							promo: <Promo />,
						} ) }
					</label>
				</div>
			) ) }
		</fieldset>
	);
};

export default BillingOptions;
