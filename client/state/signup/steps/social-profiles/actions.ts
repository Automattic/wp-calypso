import { SIGNUP_STEPS_SOCIAL_PROFILES_UPDATE } from 'calypso/state/action-types';
import 'calypso/state/signup/init';
import { SocialProfilesState } from './schema';

export function updateSocialProfiles( payload: SocialProfilesState ) {
	return {
		type: SIGNUP_STEPS_SOCIAL_PROFILES_UPDATE,
		payload,
	};
}
