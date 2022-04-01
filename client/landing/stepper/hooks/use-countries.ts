import { useSelect } from '@wordpress/data';
import { SITE_STORE } from '../stores';

export function useCountries() {
	const countries = useSelect( ( select ) => select( SITE_STORE ).getCountries() );

	if ( ! countries ) {
		return null;
	}

	return countries.countries;
}
