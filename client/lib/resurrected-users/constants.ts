export const RESURRECTION_DAY_LIMIT_DEFAULT = 373;
export const RESURRECTION_DAY_LIMIT_EXPERIMENT = 180;

export const RESURRECTED_EVENT = 'calypso_user_resurrected';
export const RESURRECTED_EVENT_6M = 'calypso_user_resurrected_6m';

export const RESURRECTED_FREE_USERS_EXPERIMENT =
	'calypso_resurrected_users_welcome_back_modal_202511';

export const WELCOME_BACK_VARIATIONS = {
	CONTROL: 'control',
	AI_ONLY: 'treatment_ai_only',
	MANUAL: 'treatment_manual_dual',
	AI_ONBOARDING: 'treatment_ai_dual',
	ALL_OPTIONS: 'treatment_all_options',
} as const;

export type WelcomeBackVariation =
	( typeof WELCOME_BACK_VARIATIONS )[ keyof typeof WELCOME_BACK_VARIATIONS ];

export const WELCOME_BACK_VARIANT_FLAGS = {
	control: 'welcome-back-modal-control',
	aiOnly: 'welcome-back-modal-ai-only',
	manual: 'welcome-back-modal-manual',
	aiCombo: 'welcome-back-modal-ai-combo',
	allOptions: 'welcome-back-modal-all-options',
} as const;

export const WELCOME_BACK_VARIATION_FLAG_MAP: Record< WelcomeBackVariation, string > = {
	[ WELCOME_BACK_VARIATIONS.CONTROL ]: WELCOME_BACK_VARIANT_FLAGS.control,
	[ WELCOME_BACK_VARIATIONS.AI_ONLY ]: WELCOME_BACK_VARIANT_FLAGS.aiOnly,
	[ WELCOME_BACK_VARIATIONS.MANUAL ]: WELCOME_BACK_VARIANT_FLAGS.manual,
	[ WELCOME_BACK_VARIATIONS.AI_ONBOARDING ]: WELCOME_BACK_VARIANT_FLAGS.aiCombo,
	[ WELCOME_BACK_VARIATIONS.ALL_OPTIONS ]: WELCOME_BACK_VARIANT_FLAGS.allOptions,
};
