import type { Design } from '@automattic/design-picker';

/*
 * Anchor.fm themes are not actual themes as we understand them.
 * They're built at site setup from specialized Headstart annotations
 * using existing themes `spearhead` and `mayland`.
 * Therefore we hard-code their data since it's not available via the themes API.
 */
export const ANCHOR_FM_THEMES: Design[] = [
	{
		title: 'Gilbert',
		slug: 'gilbert',
		template: 'gilbert',
		theme: 'spearhead',
		fonts: {
			headings: 'Roboto',
			base: 'Roboto',
		},
		is_premium: false,
		features: [ 'anchorfm' ],
		categories: [],
		design_type: 'anchor-fm',
	},
	{
		title: 'Hannah',
		slug: 'hannah',
		template: 'hannah',
		theme: 'mayland',
		fonts: {
			headings: 'Raleway',
			base: 'Cabin',
		},
		is_premium: false,
		features: [ 'anchorfm' ],
		categories: [],
		design_type: 'anchor-fm',
	},
	{
		title: 'Riley',
		slug: 'riley',
		template: 'riley',
		theme: 'spearhead',
		fonts: {
			headings: 'Raleway',
			base: 'Cabin',
		},
		is_premium: false,
		features: [ 'anchorfm' ],
		categories: [],
		design_type: 'anchor-fm',
	},
];
