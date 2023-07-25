import { getQueryArgs } from '@wordpress/url';
import type { Option } from 'calypso/landing/subscriptions/components/sort-controls';

export const getOptionLabel = < T >( options: Option< T >[], value: T ) =>
	options.find( ( option ) => option.value === value )?.label;

export const getUrlQuerySearchTerm = () => {
	const { s: urlQuerySearchTerm } = getQueryArgs( window.location.href );
	return urlQuerySearchTerm as string;
};
