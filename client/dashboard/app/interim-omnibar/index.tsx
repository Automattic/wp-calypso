import { fetchUser } from '@automattic/api-core';
import { queryClient, siteByIdQuery } from '@automattic/api-queries';
import { hydrateRoot } from 'react-dom/client';
import { AUTH_QUERY_KEY } from '../auth';

export default async function loadOmnibar() {
	const container = document.getElementById( 'wpcom-omnibar' );
	if ( ! container ) {
		return;
	}

	const [ { InterimOmnibar }, user ] = await Promise.all( [
		import( './interim-omnibar' ),
		queryClient.fetchQuery( { queryKey: AUTH_QUERY_KEY, queryFn: fetchUser } ),
	] );

	// Hydrate the server-rendered omnibar with null props first to match SSR output,
	// then immediately re-render with real data.
	const root = hydrateRoot( container, <InterimOmnibar user={ null } site={ null } /> );

	const site = user.primary_blog
		? await queryClient.fetchQuery( siteByIdQuery( user.primary_blog ) )
		: null;

	root.render( <InterimOmnibar user={ user } site={ site } /> );
}
