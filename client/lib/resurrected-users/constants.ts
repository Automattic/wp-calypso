export const RESURRECTION_DAY_LIMIT_DEFAULT = 373;
export const RESURRECTION_DAY_LIMIT_EXPERIMENT = 180;

export const RESURRECTED_EVENT = 'calypso_user_resurrected';
export const RESURRECTED_EVENT_6M = 'calypso_user_resurrected_6m';

/** Rolled-out welcome-back modal variation (manual onboarding + continue). */
export const WELCOME_BACK_VARIATION_MANUAL = 'treatment_manual_dual' as const;

/** Feature flag to force the welcome-back modal for local/testing. */
export const WELCOME_BACK_MODAL_FORCE_FLAG = 'welcome-back-modal-manual';
