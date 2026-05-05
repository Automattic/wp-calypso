import {
	INITIAL_STATE,
	type WizardAction,
	type WizardState,
	type WizardStateName,
} from './wizard-types';
import type { FediverseSiteCapabilities } from '@automattic/api-core';

export { INITIAL_STATE } from './wizard-types';

function nextEnableStepFor( caps: FediverseSiteCapabilities ): WizardStateName {
	if ( ! caps.activitypub_active ) {
		return 'ENABLING_FEATURE';
	}
	if ( ! caps.c2s_enabled ) {
		return 'ENABLING_C2S';
	}
	if ( ! caps.actors.user.enabled ) {
		return 'ENABLING_USER_ACTORS';
	}
	return 'AUTHORIZING';
}

export function wizardReducer( state: WizardState, action: WizardAction ): WizardState {
	switch ( action.type ) {
		case 'PICK_SITE':
			return {
				...state,
				name: 'CHECKING_CAPABILITIES',
				blogId: action.blogId,
				capabilities: null,
				authorizeUrl: null,
				errorStep: null,
				errorMessage: null,
			};

		case 'CAPABILITIES_LOADED':
			return {
				...state,
				name: 'CHECKLIST_READY',
				capabilities: action.capabilities,
			};

		case 'CAPABILITIES_FAILED':
			return {
				...state,
				name: 'ERROR',
				errorStep: 'capability_check',
				errorMessage: action.message,
			};

		case 'CONNECT_CLICKED': {
			if ( ! state.capabilities ) {
				return state;
			}
			return {
				...state,
				name: nextEnableStepFor( state.capabilities ),
			};
		}

		case 'ENABLE_STEP_DONE':
			return {
				...state,
				capabilities: action.capabilities,
				name: nextEnableStepFor( action.capabilities ),
			};

		case 'ENABLE_STEP_FAILED': {
			const errorStep = action.permissionDenied
				? 'permission_denied'
				: ( `enable_${ action.step }` as 'enable_feature' | 'enable_c2s' | 'enable_user_actors' );
			return {
				...state,
				name: 'ERROR',
				errorStep,
				errorMessage: action.message,
			};
		}

		case 'AUTHORIZE_DONE':
			return {
				...state,
				name: 'REDIRECTING',
				authorizeUrl: action.authorizeUrl,
			};

		case 'AUTHORIZE_FAILED':
			return {
				...state,
				name: 'ERROR',
				errorStep: 'authorize',
				errorMessage: action.message,
			};

		case 'COMPLETE_DONE':
			return {
				...state,
				name: 'DONE',
			};

		case 'COMPLETE_FAILED':
			return {
				...state,
				name: 'ERROR',
				errorStep: 'complete',
				errorMessage: action.message,
			};

		case 'RETRY_FROM_ERROR': {
			if ( state.blogId === null ) {
				return state;
			}
			return {
				...state,
				name: 'CHECKING_CAPABILITIES',
				capabilities: null,
				errorStep: null,
				errorMessage: null,
			};
		}

		case 'RESET':
			return INITIAL_STATE;

		default:
			return state;
	}
}
