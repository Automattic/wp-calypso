export { default as instagram_basic_display } from './instagram';
export { default as google_photos } from './google-photos';
export { default as google_my_business } from './google-my-business';
export { default as facebook } from './facebook';
export { default as mailchimp } from './mailchimp';
export { default as slack } from './slack';
export { default as p2_github } from './p2-github';

const services = new Set( [
	'p2_github',
	'slack',
	'facebook',
	'instagram_basic_display',
	'google_photos',
	'google_my_business',
	'mailchimp',
] );
export const hasOwnProperty = ( name ) => services.has( name );
