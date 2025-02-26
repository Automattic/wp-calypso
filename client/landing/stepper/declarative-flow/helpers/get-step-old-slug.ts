/**
 * This can be used when renaming a step. Simply add a map entry with the new step slug and the old step slug and Stepper will fire `calypso_signup_step_start` events for both slugs. This ensures that funnels with the old slug will still work.
 */
export const getStepOldSlug = ( stepSlug: string ): string | undefined => {
	const stepSlugMap: Record< string, string > = {
		'create-site': 'site-creation-step',
		'design-setup': 'designSetup',
	};

	return stepSlugMap[ stepSlug ];
};
