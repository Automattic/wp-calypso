/**
 * External dependencies
 */
import { useContext, useMemo } from '@wordpress/element';
import { getQueryArgs, getPath, buildQueryString } from '@wordpress/url';
/**
 * Internal dependencies
 */
import { unstableResourceWarning } from '../../../debug';
import { ConfigContext, type NavigationOptions, useHistory } from './router';

export function useLink( to: string, options: NavigationOptions = {} ) {
	unstableResourceWarning(
		'useLink() hook',
		'https://github.com/WordPress/gutenberg/blob/56883338749aa23acc75481c3bbc605bf1cb5a81/packages/router/src/link.tsx#L12'
	);

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

export function Link( {
	to,
	options,
	children,
	...props
}: {
	to: string;
	options?: NavigationOptions;
	children: React.ReactNode;
} ) {
	const { href, onClick } = useLink( to, options );

	return (
		<a href={ href } onClick={ onClick } { ...props }>
			{ children }
		</a>
	);
}
