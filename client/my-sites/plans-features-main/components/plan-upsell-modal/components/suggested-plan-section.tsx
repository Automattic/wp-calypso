import {
	type PlanSlug,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
} from '@automattic/calypso-products';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useGoalsFirstExperiment } from 'calypso/landing/stepper/declarative-flow/helpers/use-goals-first-experiment';
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
	const hasEnTranslation = useHasEnTranslation();
	const [ , , variationName ] = useGoalsFirstExperiment();
	const shouldUseNewCopy = variationName === 'treatment_cumulative';

	const suggestedPlans = [
		{
			planSlug: PLAN_PERSONAL,
			description:
				hasEnTranslation( 'Free one-year domain and some premium themes' ) && shouldUseNewCopy
					? translate( 'Free one-year domain and some premium themes' )
					: translate( 'Domain credit, some premium themes' ),
			disabled: hidePersonalPlan,
		},
		{
			planSlug: PLAN_PREMIUM,
			description:
				hasEnTranslation( 'Free one-year domain and all premium themes' ) && shouldUseNewCopy
					? translate( 'Free one-year domain and all premium themes' )
					: translate( 'Domain credit, all premium themes' ),
			disabled: hidePremiumPlan,
		},
		{
			planSlug: PLAN_BUSINESS,
			description:
				hasEnTranslation( 'Free one-year domain, plugins, and all premium themes' ) &&
				shouldUseNewCopy
					? translate( 'Free one-year domain, plugins, and all premium themes' )
					: translate( 'Domain credit, plugins, all premium themes' ),
		},
		{
			planSlug: PLAN_ECOMMERCE,
			description:
				hasEnTranslation(
					'Free one-year domain, plugins, all premium and store themes, WooCommerce'
				) && shouldUseNewCopy
					? translate( 'Free one-year domain, plugins, all premium and store themes, WooCommerce' )
					: translate( 'Domain credit, plugins, all premium and store themes, WooCommerce' ),
		},
	];

	return (
		<>
			{ suggestedPlans
				.filter( ( plan ) => ! plan.disabled )
				.slice( 0, 2 )
				.map( ( { planSlug, description } ) => (
					<RowWithBorder key={ planSlug }>
						<PlanItem
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
