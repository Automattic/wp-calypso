// `undefined` represents the first "intent" step
export type StepSlug = undefined | 'site-options' | 'starting-point' | 'design';

export const STEP_SLUGS: StepSlug[] = [ 'site-options', 'starting-point', 'design' ];
