/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import { LAUNCH_STORE } from '../stores';
import { useSite, useTitle } from './';

export function useDomainSearch(): string {
	const { domainSearch } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const { title } = useTitle();
	const { currentDomainName } = useSite();

	let search = domainSearch.trim() || title;

	if ( ! search || search === __( 'Site Title', __i18n_text_domain__ ) ) {
		search = currentDomainName?.split( '.' )[ 0 ] ?? '';
	}

	return search;
}
