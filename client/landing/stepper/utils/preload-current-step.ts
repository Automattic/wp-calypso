import type { StepperStep } from '../declarative-flow/internals/types';

/**
 * Eagerly fires the asyncComponent import for the step that matches the current
 * URL so the webpack module cache is warm by the time React.lazy requests it.
 *
 * This complements usePreloadSteps (which only preloads *future* steps) by
 * covering the current step on initial page load.
 *
 * We intentionally do NOT write to lazyCache here. Writing the raw component
 * would race with flowStepComponent() which stores a React.lazy wrapper in the
 * same cache slot — overwriting it would change the element type and force a
 * remount. The webpack module cache is sufficient: once the dynamic import
 * resolves, any subsequent call to the same asyncComponent returns instantly.
 */
export function preloadCurrentStep( flowSteps: readonly StepperStep[], pathname: string ): void {
	// URL shape: /setup/<flow>/<step>/<lang?>
	const stepSlug = pathname.split( '/' )[ 3 ];

	if ( ! stepSlug ) {
		return;
	}

	const currentStep = flowSteps.find( ( s ) => s.slug === stepSlug );

	if ( currentStep && 'asyncComponent' in currentStep ) {
		currentStep.asyncComponent();
	}
}
