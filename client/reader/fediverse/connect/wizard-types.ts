import type { FediverseSiteCapabilities } from '@automattic/api-core';

export type WizardStateName =
	| 'PICKING_SITE'
	| 'CHECKING_CAPABILITIES'
	| 'CHECKLIST_READY'
	| 'ENABLING_FEATURE'
	| 'ENABLING_C2S'
	| 'ENABLING_USER_ACTORS'
	| 'AUTHORIZING'
	| 'REDIRECTING'
	| 'DONE'
	| 'ERROR';

export type WizardErrorStep =
	| 'capability_check'
	| 'enable_feature'
	| 'enable_c2s'
	| 'enable_user_actors'
	| 'authorize'
	| 'permission_denied';

export interface WizardState {
	name: WizardStateName;
	blogId: number | null;
	capabilities: FediverseSiteCapabilities | null;
	authorizeUrl: string | null;
	errorStep: WizardErrorStep | null;
	errorMessage: string | null;
}

export type WizardAction =
	| { type: 'PICK_SITE'; blogId: number }
	| { type: 'CAPABILITIES_LOADED'; capabilities: FediverseSiteCapabilities }
	| { type: 'CAPABILITIES_FAILED'; message: string; permissionDenied: boolean }
	| { type: 'CONNECT_CLICKED' }
	| {
			type: 'ENABLE_STEP_DONE';
			step: 'feature' | 'c2s' | 'user_actors';
			capabilities: FediverseSiteCapabilities;
	  }
	| {
			type: 'ENABLE_STEP_FAILED';
			step: 'feature' | 'c2s' | 'user_actors';
			message: string;
			permissionDenied: boolean;
	  }
	| { type: 'AUTHORIZE_DONE'; authorizeUrl: string }
	| { type: 'AUTHORIZE_FAILED'; message: string }
	| { type: 'RETRY_FROM_ERROR' }
	| { type: 'RESET' };

export const INITIAL_STATE: WizardState = {
	name: 'PICKING_SITE',
	blogId: null,
	capabilities: null,
	authorizeUrl: null,
	errorStep: null,
	errorMessage: null,
};
