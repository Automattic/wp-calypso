/**
 * External dependencies
 */
import { useContext, useMemo } from '@wordpress/element';
import { getQueryArgs, getPath, buildQueryString } from '@wordpress/url';
/**
 * Internal dependencies
 */
import { useHistory, type NavigationOptions } from './router';
import { ConfigContext } from '.';

export function useLink( to: string, options: NavigationOptions = {} ) {
	const history = useHistory();
	const { pathArg, beforeNavigate } = useContext( ConfigContext );
	function onClick( event: React.SyntheticEvent< HTMLAnchorElement > ) {
		event?.preventDefault();
		history.navigate( to, options );
	}
	const query = getQueryArgs( to );

	// @Todo: @unstable: TS fix -> path should be string
	const path = getPath( 'http://domain.com/' + to ) || '';
	const link = useMemo( () => {
		return beforeNavigate ? beforeNavigate( { path, query } ) : { path, query };
	}, [ path, query, beforeNavigate ] );

	const [ before ] = window.location.href.split( '?' );

	return {
		href: `${ before }?${ buildQueryString( {
			[ pathArg ]: link.path,
			...link.query,
		} ) }`,
		onClick,
	};
}
