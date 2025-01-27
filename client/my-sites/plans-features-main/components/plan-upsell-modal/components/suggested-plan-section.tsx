import {
	type PlanSlug,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import PlanItem from './plan-item';
import { RowWithBorder } from '.';

interface Props {
	hidePersonalPlan?: boolean;
	hidePremiumPlan?: boolean;
	isBusy: boolean;
	onPlanSelected: ( planSlug: PlanSlug ) => void;
}

/**
 * List the suggested plan for paid features.
 */
export default function SuggestedPlanSection( {
	hidePersonalPlan,
	hidePremiumPlan,
	isBusy,
	onPlanSelected,
}: Props ) {
	const translate = useTranslate();
	const suggestedPlans = [
		{
			planSlug: PLAN_PERSONAL,
			description: translate( 'Domain credit, some premium themes' ),
			disabled: hidePersonalPlan,
		},
		{
			planSlug: PLAN_PREMIUM,
			description: translate( 'Domain credit, all premium themes' ),
			disabled: hidePremiumPlan,
		},
		{
			planSlug: PLAN_BUSINESS,
			description: translate( 'Domain credit, plugins, all premium themes' ),
		},
		{
			planSlug: PLAN_ECOMMERCE,
			description: translate( 'Domain credit, plugins, all premium and store themes, WooCommerce' ),
		},
	];

	return (
		<>
			{ suggestedPlans
				.filter( ( plan ) => ! plan.disabled )
				.slice( 0, 2 )
				.map( ( { planSlug, description } ) => (
					<RowWithBorder>
						<PlanItem
							key={ planSlug }
							planSlug={ planSlug as PlanSlug }
							description={ description }
							isBusy={ isBusy }
							onPlanSelected={ onPlanSelected }
						/>
					</RowWithBorder>
				) ) }
		</>
	);
}
