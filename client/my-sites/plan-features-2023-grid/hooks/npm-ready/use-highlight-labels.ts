import {
	isBusinessPlan,
	isPremiumPlan,
	isPersonalPlan,
	planLevelsMatch,
	PlanSlug,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../grid-context';
import { isPopularPlan } from '../../lib/is-popular-plan';
import type { TranslateResult } from 'i18n-calypso';

interface Props {
	planSlugs: PlanSlug[];
	currentSitePlanSlug?: PlanSlug | null;
	selectedPlan?: PlanSlug; // Value of the `?plan=` query param, so we can highlight a given plan.
	usePlanUpgradeabilityCheck?: ( { planSlugs }: { planSlugs: PlanSlug[] } ) => {
		[ planSlug in PlanSlug ]: boolean;
	};
}

const useHighlightLabels = ( {
	planSlugs,
	currentSitePlanSlug,
	selectedPlan,
	usePlanUpgradeabilityCheck,
}: Props ) => {
	const { intent } = usePlansGridContext();
	const translate = useTranslate();
	const planUpgradeability = usePlanUpgradeabilityCheck?.( { planSlugs } );

	return planSlugs.reduce( ( acc, planSlug ) => {
		const isCurrentPlan = currentSitePlanSlug === planSlug;
		const isPlanAvailableForUpgrade = planUpgradeability?.[ planSlug ];
		const isSuggestedPlan =
			selectedPlan && planLevelsMatch( planSlug, selectedPlan ) && isPlanAvailableForUpgrade;

		let label;
		if ( isCurrentPlan ) {
			label = translate( 'Your plan' );
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
	}, {} as Record< PlanSlug, TranslateResult | null > );
};

export default useHighlightLabels;
