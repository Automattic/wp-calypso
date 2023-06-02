export type SocialProfileUrlKey = 'facebookUrl' | 'twitterUrl' | 'instagramUrl' | 'linkedinUrl';

export type SocialProfilesState = {
	[ key in SocialProfileUrlKey ]: string;
};
