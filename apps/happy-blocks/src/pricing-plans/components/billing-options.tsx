import { createInterpolateElement } from '@wordpress/element';
import { FunctionComponent } from 'react';
import { PricingPlanBilling } from '../types';

const Promo: FunctionComponent = ( { children } ) => (
	<span className="wp-block-a8c-pricing-plans__detail-billings-item-promo">({ children })</span>
);

interface Props {
	billings: PricingPlanBilling[];
	value: string;
	onChange: ( value: string ) => void;
}

const BillingOptions: FunctionComponent< Props > = ( { billings, value, onChange } ) => {
	return (
		<fieldset className="wp-block-a8c-pricing-plans__detail-billings">
			{ billings.map( ( planBilling ) => (
				<div
					key={ planBilling.planSlug }
					className="wp-block-a8c-pricing-plans__detail-billings-item"
				>
					<label className="wp-block-a8c-pricing-plans__detail-billings-item-label">
						<input
							className="wp-block-a8c-pricing-plans__detail-billings-item-input"
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
