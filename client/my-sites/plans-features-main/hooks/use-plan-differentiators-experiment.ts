import { useExperiment } from 'calypso/lib/explat';
import { useSelector } from 'calypso/state';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';
import type { IAppState } from 'calypso/state/types';

type PlanDifferentiatorsExperimentVariant = 'control' | 'var1' | 'var1d' | 'var3' | 'var4' | 'var5';

type PlanDifferentiatorsExperimentResult = {
	isLoading: boolean;
	variant?: PlanDifferentiatorsExperimentVariant;
	/**
	 * When true, show "Everything in X, plus:" with incremental features.
	 * Applies to: var1, var1d, var3, var5
	 */
	isStacked: boolean;
	/**
	 * When true, use the long/full feature set instead of simplified.
	 * Applies to: var3, var4
	 */
	isLongSet: boolean;
	/**
	 * When true, use the short/simplified feature set instead of simplified.
	 * Applies to: var1, var1d, var5
	 */
	isShortSet: boolean;
	/**
	 * When true, show the differentiator header (3 bullet points).
	 * Currently disabled for all variants.
	 */
	showDifferentiatorHeader: boolean;
	/**
	 * When true, use var5 feature set (getVar5StackedSignupWpcomFeatures).
	 * Applies to: var5
	 */
	useVar5Features: boolean;
	/**
	 * When true, use var4 feature set (getLongSetSignupWpcomFeatures).
	 * Applies to: var4
	 */
	useVar4Features: boolean;
	/**
	 * When true, use var3 feature set (getLongSetStackedSignupWpcomFeatures).
	 * Applies to: var3
	 */
	useVar3Features: boolean;
	/**
	 * When true, use var1/var1d feature set (getShortSetStackedSignupWpcomFeatures).
	 * Applies to: var1, var1d
	 */
	useVar1Features: boolean;
	/**
	 * When true, the user is specifically in the var1d variant.
	 * Used to apply differentiator styling to features below "Everything in X" headers.
	 */
	isVar1dVariant: boolean;
	/**
	 * When true, the user is specifically in the var4 variant.
	 * Used to exclude var4 from certain experiment-specific styling.
	 */
	isVar4Variant: boolean;
	/**
	 * When true, the user is in an experiment variant (not control).
	 */
	isExperimentVariant: boolean;
};

interface UsePlanDifferentiatorsExperimentParams {
	flowName?: string | null;
	isInSignup: boolean;
	siteId?: number | null;
}

/**
 * Returns the control state for the experiment (no variant assigned).
 */
function getControlResult(): PlanDifferentiatorsExperimentResult {
	return {
		isLoading: false,
		variant: undefined,
		isStacked: false,
		isLongSet: false,
		isShortSet: false,
		showDifferentiatorHeader: false,
		useVar5Features: false,
		useVar4Features: false,
		useVar3Features: false,
		useVar1Features: false,
		isVar1dVariant: false,
		isVar4Variant: false,
		isExperimentVariant: false,
	};
}

/**
 * Builds the experiment result from a variant.
 */
function buildResultFromVariant(
	isLoading: boolean,
	variant: PlanDifferentiatorsExperimentVariant | undefined
): PlanDifferentiatorsExperimentResult {
	const isExperimentVariant = variant !== undefined && variant !== 'control';

	return {
		isLoading,
		variant,
		isStacked:
			variant === 'var1' || variant === 'var1d' || variant === 'var3' || variant === 'var5',
		isLongSet: variant === 'var3' || variant === 'var4',
		isShortSet: variant === 'var1' || variant === 'var1d' || variant === 'var5',
		showDifferentiatorHeader: false,
		useVar5Features: variant === 'var5',
		useVar4Features: variant === 'var4',
		useVar3Features: variant === 'var3',
		useVar1Features: variant === 'var1' || variant === 'var1d',
		isVar1dVariant: variant === 'var1d',
		isVar4Variant: variant === 'var4',
		isExperimentVariant,
	};
}

function usePlanDifferentiatorsExperiment( {
	flowName,
	isInSignup,
	siteId,
}: UsePlanDifferentiatorsExperimentParams ): PlanDifferentiatorsExperimentResult {
	// Check if the site has the gating business Q1 flag (set when user purchased through experiment)
	const isGatingBusinessQ1 = useSelector( ( state: IAppState ) =>
		siteId ? getSiteOption( state, siteId, 'is_gating_business_q1' ) : false
	);

	// Determine experiment eligibility based on context:
	// - Signup flow (no siteId): Run experiment to create/get assignment
	// - Logged-in with siteId and is_gating_business_q1=true: Run experiment to get cached assignment
	// - Logged-in with siteId and is_gating_business_q1=false: Don't run experiment (show control)
	const isEligibleSignupFlow = isInSignup && flowName === 'onboarding';
	const isEligibleExistingSite = ! isInSignup && !! siteId && !! isGatingBusinessQ1;
	const isEligible =
		process.env.NODE_ENV !== 'test' && ( isEligibleSignupFlow || isEligibleExistingSite );

	const [ isLoading, assignment ] = useExperiment( 'calypso_pricing_differentiation_202601_v1', {
		isEligible,
	} );

	// If user has a site but is not in the experiment (is_gating_business_q1=false), return control
	if ( siteId && ! isGatingBusinessQ1 && ! isInSignup ) {
		return getControlResult();
	}

	const variant = ( assignment?.variationName ?? undefined ) as
		| PlanDifferentiatorsExperimentVariant
		| undefined;

	return buildResultFromVariant( isLoading, variant );
}

export default usePlanDifferentiatorsExperiment;
export type { PlanDifferentiatorsExperimentVariant, PlanDifferentiatorsExperimentResult };
