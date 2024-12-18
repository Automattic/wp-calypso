import type { ExperimentManifest, ExperimentSlug } from './types';

export const experimentsCatalog: Record< ExperimentSlug, ExperimentManifest > = {
	signup: {
		title: 'Sign Up Experiment - Between /start and /setup',
		description: 'This experiment is to test the sign up flow between /start and /setup',
		experiment_explat_id: '22136',
		experiment_explat_name: 'explat_test_alshakero_url_dispatcher',
		variants: {
			control: {
				description: 'The current sign up flow',
				url: '/start',
			},
			treatment: {
				description: 'The new sign up flow',
				url: '/setup/onboarding',
			},
		},
	},
} as const;
