type HandleProgressStepSelectOptions = {
	forceCheckoutBackUrlDomains: string | undefined;
	forceCheckoutBackUrl: string | undefined;
	clickStepBack: ( destinationUrl: string ) => void;
	clickClose: () => void;
};

/**
 * Routes a click on the onboarding progress indicator to the correct
 * leave-checkout action. Clicking the "domains" or "plans" step navigates back
 * to that step via `clickStepBack` (preserving the step-back analytics signal),
 * but only when a validated back URL is available for it. When no valid URL
 * exists, it falls back to the standard close flow.
 */
export function handleProgressStepSelect(
	step: 'domains' | 'plans',
	{
		forceCheckoutBackUrlDomains,
		forceCheckoutBackUrl,
		clickStepBack,
		clickClose,
	}: HandleProgressStepSelectOptions
): void {
	if ( step === 'domains' && forceCheckoutBackUrlDomains ) {
		clickStepBack( forceCheckoutBackUrlDomains );
		return;
	}
	if ( step === 'plans' && forceCheckoutBackUrl ) {
		clickStepBack( forceCheckoutBackUrl );
		return;
	}
	clickClose();
}
