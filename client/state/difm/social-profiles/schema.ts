export const SUPPORTED_SOCIAL_PROFILES = [
	'FACEBOOK',
	'TWITTER',
	'INSTAGRAM',
	'LINKEDIN',
] as const;

export type SocialProfile = typeof SUPPORTED_SOCIAL_PROFILES[ number ];

export type SocialProfilesState = Record< SocialProfile, string >;

export const schema = {
	type: 'object',
	patternProperties: SUPPORTED_SOCIAL_PROFILES.reduce(
		( state, socialProfile ) => ( { ...state, [ socialProfile ]: { type: 'string' } } ),
		{}
	),
};

export const initialState = SUPPORTED_SOCIAL_PROFILES.reduce(
	( state, socialProfile ) => ( { ...state, [ socialProfile ]: '' } ),
	{}
);
