/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';

/**
 * External dependencies
 */
import { LAUNCH_STORE } from '../stores';

export function useDomainSearch() {
	const { domainSearch } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const [ title ] = useEntityProp( 'root', 'site', 'title' );

	return ( domainSearch.trim() || title ) ?? '';
}
