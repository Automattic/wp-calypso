import { TERM_ANNUALLY, TERM_MONTHLY } from '@automattic/calypso-products';
import { sprintf, __ } from '@wordpress/i18n';
import { FunctionComponent } from 'react';
import { BlockPlan } from '../hooks/pricing-plans';

const Promo: FunctionComponent = ( { children } ) => (
	<span className="hb-pricing-plans-embed__promo">{ children }</span>
);

interface Props {
	plans: BlockPlan[];
	value: string;
	onChange: ( value?: string ) => void;
}

const getAnnualDiscount = ( annualPlan?: BlockPlan, monthlyPlan?: BlockPlan ) => {
	if ( ! annualPlan || ! monthlyPlan ) {
		return null;
	}

	const annualPricePerMonth = annualPlan.rawPrice / 12;

	const discountRate = Math.round(
		( 100 * ( monthlyPlan.rawPrice - annualPricePerMonth ) ) / monthlyPlan.rawPrice
	);

	return sprintf(
		// translators: %s is the discount rate
		__( 'Save %s', 'happy-blocks' ),
		`${ discountRate }%`
	);
};

const BillingOptions: FunctionComponent< Props > = ( { plans, value, onChange } ) => {
	const selectedPlan = plans?.find( ( plan ) => plan.productSlug === value );

	if ( ! plans || ! selectedPlan ) {
		return null;
	}

	const monthlyPlan =
		selectedPlan.term === TERM_MONTHLY
			? selectedPlan
			: plans.find( ( plan ) => plan.term === TERM_MONTHLY && plan.type === selectedPlan.type );

	const annualPlan =
		selectedPlan.term === TERM_ANNUALLY
			? selectedPlan
			: plans.find( ( plan ) => plan.term === TERM_ANNUALLY && plan.type === selectedPlan.type );

	const annualDiscount = getAnnualDiscount( annualPlan, monthlyPlan );

	const planChoices = [ monthlyPlan, annualPlan ].filter( Boolean );

	return (
		<fieldset className="hb-pricing-plans-embed__billing-options">
			{ planChoices.map( ( planBilling ) => (
				<div key={ planBilling?.productSlug }>
					<label className="hb-pricing-plans-embed__billing-option-label">
						<input
							className="hb-pricing-plans-embed__billing-option-input"
							type="radio"
							name="price"
							value={ planBilling?.productSlug }
							checked={ planBilling?.productSlug === value }
							onChange={ () => onChange( planBilling?.productSlug ) }
						/>
						{ planBilling?.term === TERM_MONTHLY
							? __( 'Monthly', 'happy-blocks' )
							: __( 'Annually', 'happy-blocks' ) }
						{ annualDiscount && planBilling?.term === TERM_ANNUALLY && (
							<Promo>({ annualDiscount })</Promo>
						) }
					</label>
				</div>
			) ) }
		</fieldset>
	);
};

export default BillingOptions;
