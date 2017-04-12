// testing primary-domain

export const SITE_ID = 123;

export const SITE_RESPONSE_FIRST = {
	ID: 123,
	jetpack: true,
	options: {
		software_version: '4.7.3',
		jetpack_version: '4.8-alpha'
	},
	updates: {
		plugins: 9,
		themes: 1,
		wordpress: 0,
		translations: 1,
		total: 11
	}
};

export const SITE_UPDATES_RESPONSE = {
	plugins: 9,
	themes: 1,
	wordpress: 0,
	translations: 1,
	total: 11,
	wp_version: '4.7.3',
	jp_version: '4.8-alpha'
};

// WP REST-API error response
export const ERROR_MESSAGE_RESPONSE = 'AN ERROR';
