import { isWpComAnnualPlan, isWpComMonthlyPlan } from '@automattic/calypso-products';
import { useInstanceId } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { FunctionComponent } from 'react';
import usePlanVariants from '../hooks/plan-variants';
import { BlockPlan } from '../hooks/pricing-plans';

const Promo: FunctionComponent = ( { children } ) => (
	<span className="hb-pricing-plans-embed__promo">{ children }</span>
);

interface Props {
	plans: BlockPlan[];
	value: string;
	onChange: ( value: string ) => void;
}

const BillingOptions: FunctionComponent< Props > = ( { plans, value, onChange } ) => {
	const selectedPlan = plans?.find( ( plan ) => plan.productSlug === value ) ?? plans[ 0 ];
	const { monthlyPlan, annualPlan, annualDiscount } = usePlanVariants( plans, selectedPlan );
	const instanceId = useInstanceId( BillingOptions );
	const id = `hb-plans-radio-control-${ instanceId }`;

	if ( ! monthlyPlan || ! annualPlan ) {
		return null;
	}

	return (
		<fieldset className="hb-pricing-plans-embed__billing-options">
			{ [ monthlyPlan, annualPlan ].map( ( plan ) => (
				<div key={ plan?.productSlug }>
					<label className="hb-pricing-plans-embed__billing-option-label">
						<input
							className="hb-pricing-plans-embed__billing-option-input"
							id={ id }
							type="radio"
							value={ plan?.productSlug }
							checked={ plan?.productSlug === value }
							onChange={ () => onChange( plan?.productSlug ) }
						/>
						{ isWpComMonthlyPlan( plan.productSlug )
							? __( 'Monthly', 'happy-blocks' )
							: __( 'Annually', 'happy-blocks' ) }
						{ annualDiscount && isWpComAnnualPlan( plan.productSlug ) && (
							<Promo>({ annualDiscount })</Promo>
						) }
					</label>
				</div>
			) ) }
		</fieldset>
	);
};

export default BillingOptions;
