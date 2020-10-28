/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useEntityProp } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';
import { Launch } from '@automattic/data-stores';

/**
 * External dependencies
 */
import { useSite } from './';

export function useDomainSearch() {
	const { domainSearch } = useSelect( ( select ) => select( Launch.STORE_KEY ).getState() );
	const [ title ] = useEntityProp( 'root', 'site', 'title' );
	const { currentDomainName } = useSite();

	let search = domainSearch.trim() || title;

	if ( ! search || search === __( 'Site Title', 'full-site-editing' ) ) {
		search = currentDomainName?.split( '.' )[ 0 ] ?? '';
	}

	return search;
}
