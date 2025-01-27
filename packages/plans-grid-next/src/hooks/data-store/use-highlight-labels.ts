import {
	isBusinessPlan,
	isPremiumPlan,
	isPersonalPlan,
	planLevelsMatch,
	type PlanSlug,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { isSamePlan } from '../../lib/is-same-plan';
import { isPopularPlan } from './is-popular-plan';
import type { PlansIntent } from '../../types';
import type { TranslateResult } from 'i18n-calypso';

interface Props {
	intent?: PlansIntent;
	planSlugs: PlanSlug[];
	currentSitePlanSlug?: PlanSlug | null;
	selectedPlan?: PlanSlug; // Value of the `?plan=` query param, so we can highlight a given plan.
	plansAvailabilityForPurchase?: {
		[ key: string ]: boolean;
	};
	highlightLabelOverrides?: { [ K in PlanSlug ]?: TranslateResult };
	isDomainOnlySite: boolean;
}

// TODO clk: move to plans data store
const useHighlightLabels = ( {
	intent,
	planSlugs,
	currentSitePlanSlug,
	selectedPlan,
	plansAvailabilityForPurchase,
	highlightLabelOverrides,
	isDomainOnlySite,
}: Props ) => {
	const translate = useTranslate();

	return planSlugs.reduce(
		( acc, planSlug ) => {
			if ( highlightLabelOverrides?.[ planSlug ] ) {
				return {
					...acc,
					[ planSlug ]: highlightLabelOverrides[ planSlug ],
				};
			}

			const isCurrentPlan = currentSitePlanSlug
				? isSamePlan( currentSitePlanSlug, planSlug ) && ! isDomainOnlySite
				: false;
			const isPlanAvailableForPurchase = plansAvailabilityForPurchase?.[ planSlug ];
			const isSuggestedPlan =
				selectedPlan && planLevelsMatch( planSlug, selectedPlan ) && isPlanAvailableForPurchase;

			let label;
			if ( isCurrentPlan ) {
				label = translate( 'Your plan' );
			} else if ( ! isPlanAvailableForPurchase ) {
				label = null;
			} else if ( isSuggestedPlan ) {
				label = translate( 'Suggested' );
			} else if ( 'plans-newsletter' === intent ) {
				if ( isPersonalPlan( planSlug ) ) {
					label = translate( 'Best for Newsletter' );
				}
			} else if ( 'plans-link-in-bio' === intent ) {
				if ( isPremiumPlan( planSlug ) ) {
					label = translate( 'Best for Link in Bio' );
				}
			} else if ( 'plans-videopress' === intent ) {
				if ( isBusinessPlan( planSlug ) ) {
					label = translate( 'Best for Video' );
				}
			} else if ( 'plans-blog-onboarding' === intent ) {
				if ( isPremiumPlan( planSlug ) ) {
					label = translate( 'Best for Blog' );
				}
			} else if ( isBusinessPlan( planSlug ) && ! selectedPlan ) {
				label = translate( 'Best for devs' );
			} else if ( isPopularPlan( planSlug ) && ! selectedPlan ) {
				label = translate( 'Popular' );
			}

			return {
				...acc,
				[ planSlug ]: label ?? null,
			};
		},
		{} as Record< PlanSlug, TranslateResult | null >
	);
};

export default useHighlightLabels;
