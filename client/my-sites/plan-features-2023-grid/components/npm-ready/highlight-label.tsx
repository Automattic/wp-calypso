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

interface Props {
	planSlug: PlanSlug;
	currentSitePlanSlug?: PlanSlug | null;
	selectedPlan?: PlanSlug; // Value of the `?plan=` query param, so we can highlight a given plan.
	useIsPlanAvailableForUpgradeCheck?: ( { planSlug }: { planSlug: PlanSlug } ) => boolean;
}

const HighlightLabel = ( {
	planSlug,
	currentSitePlanSlug,
	selectedPlan,
	useIsPlanAvailableForUpgradeCheck,
}: Props ) => {
	const { intent } = usePlansGridContext();
	const translate = useTranslate();
	const isCurrentPlan = currentSitePlanSlug === planSlug;
	const isPlanAvailableForUpgrade = useIsPlanAvailableForUpgradeCheck?.( { planSlug } );
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

	// TODO clk: This should evolve to the full `PlanPill` element once that part gets refactored.
	return label ? <>{ label }</> : null;
};

export default HighlightLabel;
