import { getQueryArgs } from '@wordpress/url';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';
import type { Option } from 'calypso/landing/subscriptions/components/sort-controls';

export const getOptionLabel = < T >( options: Option< T >[], value: T ) =>
	options.find( ( option ) => option.value === value )?.label;

export const getUrlQuerySearchTerm = () => {
	const { s: urlQuerySearchTerm } = getQueryArgs( window.location.href );
	return urlQuerySearchTerm as string;
};

export const isValidUrl = ( url: string ) => {
	try {
		// eslint-disable-next-line no-new
		new URL( url );
		return CAPTURE_URL_RGX.test( url );
	} catch ( e ) {
		return false;
	}
};
