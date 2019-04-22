/** @format */
export eventbrite from './eventbrite';
export instagram from './instagram';
export google_photos from './google-photos';
export google_my_business from './google-my-business';
export facebook from './facebook';
export mailchimp from './mailchimp';

const services = new Set( [
	'eventbrite',
	'facebook',
	'instagram',
	'google_photos',
	'google_my_business',
	'mailchimp',
] );
export const hasOwnProperty = name => services.has( name );
