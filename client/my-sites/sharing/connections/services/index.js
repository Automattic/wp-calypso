/** @format */
export eventbrite from './eventbrite';
export instagram from './instagram';
export google_photos from './google-photos';

const services = new Set( [ 'eventbrite', 'instagram', 'google_photos' ] );
export const hasOwnProperty = name => services.has( name );
