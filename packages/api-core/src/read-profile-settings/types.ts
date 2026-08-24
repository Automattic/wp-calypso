export interface ReadProfileSettingsResponse {
	settings: {
		'reader-profile-posts-visibility': 'public' | 'hidden';
		'reader-profile-sites-visibility': 'public' | 'hidden';
	};
}
