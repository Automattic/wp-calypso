import { fetchUser } from '@automattic/api-core';
import { queryClient, siteByIdQuery } from '@automattic/api-queries';
import { createRoot } from 'react-dom/client';
import { AUTH_QUERY_KEY } from '../auth';

import './style.scss';

export default async function loadOmnibar() {
	const container = document.getElementById( 'wpcom-omnibar' );
	if ( ! container ) {
		return;
	}

	const [ { InterimOmnibar }, user ] = await Promise.all( [
		import( './interim-omnibar' ),
		queryClient.fetchQuery( { queryKey: AUTH_QUERY_KEY, queryFn: fetchUser } ),
	] );

	const site = user.primary_blog
		? await queryClient.fetchQuery( siteByIdQuery( user.primary_blog ) )
		: null;

	const wpcom = document.getElementById( 'wpcom' );
	if ( wpcom ) {
		wpcom.style.marginTop = 'var(--masterbar-height, 47px)';
	}

	const root = createRoot( container );
	root.render( <InterimOmnibar user={ user } site={ site } /> );
}
