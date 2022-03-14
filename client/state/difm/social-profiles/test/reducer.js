import { expect } from 'chai';
import {
	SIGNUP_STEPS_SOCIAL_PROFILES_UPDATE,
	SIGNUP_STEPS_SOCIAL_PROFILES_RESET,
	SIGNUP_COMPLETE_RESET,
} from 'calypso/state/action-types';
import difmSocialProfilesReducer from '../reducer';
import { initialState } from '../schema';

describe( 'reducer', () => {
	test( 'should update social profiles', () => {
		expect(
			difmSocialProfilesReducer(
				{},
				{
					type: SIGNUP_STEPS_SOCIAL_PROFILES_UPDATE,
					payload: {
						FACEBOOK: 'facebookUrl',
						TWITTER: 'twitterUrl',
						INSTAGRAM: 'instagramUrl',
						LINKEDIN: 'linkedinUrl',
					},
				}
			)
		).to.be.eql( {
			FACEBOOK: 'facebookUrl',
			TWITTER: 'twitterUrl',
			INSTAGRAM: 'instagramUrl',
			LINKEDIN: 'linkedinUrl',
		} );
	} );

	test( 'should reset the state on reset action', () => {
		expect(
			difmSocialProfilesReducer(
				{
					FACEBOOK: 'facebookUrl',
					TWITTER: 'twitterUrl',
					INSTAGRAM: 'instagramUrl',
					LINKEDIN: 'linkedinUrl',
				},
				{
					type: SIGNUP_STEPS_SOCIAL_PROFILES_RESET,
					action: {},
				}
			)
		).to.be.eql( initialState );
	} );

	test( 'should reset the state on signup complete', () => {
		expect(
			difmSocialProfilesReducer(
				{
					FACEBOOK: 'facebookUrl',
					TWITTER: 'twitterUrl',
					INSTAGRAM: 'instagramUrl',
					LINKEDIN: 'linkedinUrl',
				},
				{
					type: SIGNUP_COMPLETE_RESET,
					action: {},
				}
			)
		).to.be.eql( initialState );
	} );
} );
