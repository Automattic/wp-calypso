export { default as eventbrite } from './eventbrite';
export { default as instagram } from './instagram';
export { default as google_photos } from './google-photos';
export { default as google_my_business } from './google-my-business';
export { default as facebook } from './facebook';
export { default as mailchimp } from './mailchimp';

const services = new Set( [
	'eventbrite',
	'facebook',
	'instagram',
	'google_photos',
	'google_my_business',
	'mailchimp',
] );
export const hasOwnProperty = name => services.has( name );
