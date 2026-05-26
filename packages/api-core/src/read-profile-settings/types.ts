export interface ReadProfileSettingsResponse {
	settings: {
		'achievements-visibility': 'public' | 'private';
		'reader-profile-posts-visibility': 'public' | 'hidden';
		'reader-profile-sites-visibility': 'public' | 'hidden';
	};
}
