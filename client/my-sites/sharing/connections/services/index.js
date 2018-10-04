/** @format */
export eventbrite from './eventbrite';
export instagram from './instagram';
export google_photos from './google-photos';
export google_my_business from './google-my-business';
export facebook from './facebook';

const services = new Set( [
	'eventbrite',
	'facebook',
	'instagram',
	'google_photos',
	'google_my_business',
] );
export const hasOwnProperty = name => services.has( name );
