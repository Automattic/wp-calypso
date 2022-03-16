import {
	SIGNUP_STEPS_SOCIAL_PROFILES_UPDATE,
	SIGNUP_STEPS_SOCIAL_PROFILES_RESET,
} from 'calypso/state/action-types';
import 'calypso/state/signup/init';
import { SocialProfilesState } from './schema';

export function updateSocialProfiles( payload: SocialProfilesState ) {
	return {
		type: SIGNUP_STEPS_SOCIAL_PROFILES_UPDATE,
		payload,
	};
}

export function resetSocialProfiles() {
	return {
		type: SIGNUP_STEPS_SOCIAL_PROFILES_RESET,
	};
}
