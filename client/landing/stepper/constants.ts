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

/**
 * All Tracks events related to Stepper.
 * Prefixed with `STEPPER_TRACKS_EVENT_[scope]_[action]` to avoid conflicts with other Tracks events.
 * Example: `STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT` -> scope = `STEP_NAV`, action = `SUBMIT`
 */
export const STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT = 'calypso_signup_actions_submit_step';
export const STEPPER_TRACKS_EVENT_STEP_NAV_GO_BACK = 'calypso_signup_step_nav_back';
export const STEPPER_TRACKS_EVENT_STEP_NAV_GO_NEXT = 'calypso_signup_step_nav_next';
export const STEPPER_TRACKS_EVENT_STEP_NAV_GO_TO = 'calypso_signup_step_nav_go_to';
export const STEPPER_TRACKS_EVENT_STEP_NAV_EXIT_FLOW = 'calypso_signup_step_nav_exit_flow';
export const STEPPER_TRACKS_EVENT_SIGNUP_START = 'calypso_signup_start';
export const STEPPER_TRACKS_EVENT_SIGNUP_STEP_START = 'calypso_signup_step_start';
export const STEPPER_TRACKS_EVENT_FLOW_START = 'calypso_stepper_flow_start';
export const STEPPER_TRACKS_EVENT_PAGE_VIEW = 'calypso_page_view';

export const STEPPER_TRACKS_EVENTS_STEP_NAV = < const >[
	STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT,
	STEPPER_TRACKS_EVENT_STEP_NAV_GO_BACK,
	STEPPER_TRACKS_EVENT_STEP_NAV_GO_NEXT,
	STEPPER_TRACKS_EVENT_STEP_NAV_GO_TO,
	STEPPER_TRACKS_EVENT_STEP_NAV_EXIT_FLOW,
];

export const STEPPER_TRACKS_EVENTS = < const >[
	...STEPPER_TRACKS_EVENTS_STEP_NAV,
	STEPPER_TRACKS_EVENT_SIGNUP_START,
	STEPPER_TRACKS_EVENT_SIGNUP_STEP_START,
	STEPPER_TRACKS_EVENT_FLOW_START,
	STEPPER_TRACKS_EVENT_PAGE_VIEW,
];
