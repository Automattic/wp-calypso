import {
	isBusinessPlan,
	isPremiumPlan,
	isPersonalPlan,
	planLevelsMatch,
	PlanSlug,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../grid-context';
import { isPopularPlan } from '../lib/is-popular-plan';

interface Props {
	planSlugs: PlanSlug[];
	currentSitePlanSlug?: PlanSlug | null;
	selectedPlan?: PlanSlug; // Value of the `?plan=` query param, so we can highlight a given plan.
	usePlanAvailabilityCheck?: ( { planSlug }: { planSlug: PlanSlug } ) => boolean;
}

const HighlightLabel = ( {
	planSlug,
	currentSitePlanSlug,
	selectedPlan,
	usePlanAvailabilityCheck,
}: Omit< Props, 'planSlugs' > & { planSlug: PlanSlug } ) => {
	const { intent } = usePlansGridContext();
	const translate = useTranslate();
	const isCurrentPlan = currentSitePlanSlug === planSlug;
	const isPlanAvailableForUpgrade = usePlanAvailabilityCheck?.( { planSlug } );
	const isSuggestedPlan =
		selectedPlan && planLevelsMatch( planSlug, selectedPlan ) && isPlanAvailableForUpgrade;

	if ( isCurrentPlan ) {
		return translate( 'Your plan' );
	} else if ( isSuggestedPlan ) {
		return translate( 'Suggested' );
	} else if ( 'plans-newsletter' === intent ) {
		if ( isPersonalPlan( planSlug ) ) {
			return translate( 'Best for Newsletter' );
		}
	} else if ( 'plans-link-in-bio' === intent ) {
		if ( isPremiumPlan( planSlug ) ) {
			return translate( 'Best for Link in Bio' );
		}
	} else if ( 'plans-blog-onboarding' === intent ) {
		if ( isPremiumPlan( planSlug ) ) {
			return translate( 'Best for Blog' );
		}
	} else if ( isBusinessPlan( planSlug ) && ! selectedPlan ) {
		return translate( 'Best for devs' );
	} else if ( isPopularPlan( planSlug ) && ! selectedPlan ) {
		return translate( 'Popular' );
	}

	return null;
};

const useHighlightLabel = ( {
	planSlugs,
	currentSitePlanSlug,
	selectedPlan,
	usePlanAvailabilityCheck,
}: Props ) => {
	planSlugs.map( ( planSlug ) => {
		return <HighlightLabel planSlug={ planSlug } currentSitePlanSlug={ currentSitePlanSlug } />;
	} );
};

export default useHighlightLabel;
