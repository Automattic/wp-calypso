import type { Design } from '@automattic/design-picker';

// Changing this? Consider also updating DEFAULT_START_WRITING_THEME so the write *flow* matches the write intent.
export const WRITE_INTENT_DEFAULT_DESIGN: Design = {
	slug: 'poema',
	title: 'Poema',
	categories: [],
	theme: 'poema',
	design_tier: null,
};

export const SITE_PICKER_FILTER_CONFIG = [ 'wpcom', 'atomic' ];
export const HOW_TO_MIGRATE_OPTIONS = {
	DO_IT_FOR_ME: 'difm',
	DO_IT_MYSELF: 'myself',
};
