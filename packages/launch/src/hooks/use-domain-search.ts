/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useEntityProp } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import { LAUNCH_STORE } from '../stores';
import { useSite } from './';

export function useDomainSearch() {
	const { domainSearch } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const [ title ] = useEntityProp( 'root', 'site', 'title' );
	const { currentDomainName } = useSite();

	let search = domainSearch.trim() || title;

	if ( ! search || search === __( 'Site Title', __i18n_text_domain__ ) ) {
		search = currentDomainName?.split( '.' )[ 0 ] ?? '';
	}

	return search;
}
