import { useRef } from '@wordpress/element';
import { useSelector } from 'react-redux';
import { useExperiment } from 'calypso/lib/explat';
import { getPreference } from 'calypso/state/preferences/selectors';
import getSite from 'calypso/state/sites/selectors/get-site';
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

function usePlanDifferentiatorsExperiment( {
	flowName,
	isInSignup,
	siteId,
}: UsePlanDifferentiatorsExperimentParams ): PlanDifferentiatorsExperimentResult {
	const site = useSelector( ( state: IAppState ) => getSite( state, siteId ) );

	// Use a ref to "lock in" the gating flag once it's been set to true.
	// This prevents the flag from becoming undefined if site data is refetched
	// without this field included in the response.
	const gatingFlagRef = useRef< boolean >( false );
	if ( site?.options?.is_gating_business_q1 === true ) {
		gatingFlagRef.current = true;
	}
	const hasGatingFlag = gatingFlagRef.current;

	const assignmentFromPreference = useSelector( ( state: IAppState ) =>
		hasGatingFlag ? getPreference( state, 'calypso_pricing_differentiation_202601_v1' ) : null
	);

	// Eligible for onboarding signup flow or when user preference is set
	const isEligibleSignupFlow = isInSignup && flowName === 'onboarding';
	const isEligibleAdminIntent = ! isInSignup && hasGatingFlag && !! assignmentFromPreference;
	const isEligible =
		process.env.NODE_ENV !== 'test' && ( isEligibleSignupFlow || isEligibleAdminIntent );

	const [ isLoading, assignment ] = useExperiment( 'calypso_pricing_differentiation_202601_v1', {
		isEligible,
	} );

	// Use stored assignment to avoid waiting for the API response
	const variant = ( assignmentFromPreference || assignment?.variationName || undefined ) as
		| PlanDifferentiatorsExperimentVariant
		| undefined;

	const isExperimentVariant = variant !== undefined && variant !== 'control';

	// Map variants to feature sets:
	// var4 -> getLongSetSignupWpcomFeatures
	// var1, var1d -> getShortSetStackedSignupWpcomFeatures
	// var3 -> getLongSetStackedSignupWpcomFeatures
	// var5 -> getVar5StackedSignupWpcomFeatures

	return {
		isLoading: assignmentFromPreference ? false : isLoading,
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

export default usePlanDifferentiatorsExperiment;
export type { PlanDifferentiatorsExperimentVariant, PlanDifferentiatorsExperimentResult };
