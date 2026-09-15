/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { usePlugin } from '../use-plugin';

function PluginSummary( { slug }: { slug: string } ) {
	const { isLoading, sitesWithThisPlugin, sitesWithoutThisPlugin } = usePlugin( slug );
	if ( isLoading ) {
		return <p>Loading</p>;
	}
	return (
		<>
			<p>Installed: { sitesWithThisPlugin.length }</p>
			<p>Available: { sitesWithoutThisPlugin.length }</p>
			{ sitesWithThisPlugin.map( ( site ) => (
				<a key={ site.ID } href={ site.actionLinks?.Settings }>
					{ site.name }
				</a>
			) ) }
		</>
	);
}

test.each( [
	[ 0, 200 ],
	[ 1, 200 ],
	[ 100, 200 ],
	[ 1, 500 ],
] )( 'fetches action links for %i installed sites with HTTP %i', async ( installed, status ) => {
	const sites = Array.from( { length: 100 }, ( _, index ) => ( {
		ID: index + 1,
		name: `Site ${ index + 1 }`,
		URL: `https://site-${ index + 1 }.example`,
		capabilities: { update_plugins: true },
	} ) );
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, { sites } )
		.get( '/rest/v1.1/me/sites/plugins' )
		.query( true )
		.reply( 200, {
			sites: Object.fromEntries(
				sites.map( ( site ) => [
					site.ID,
					[ { slug: site.ID <= installed ? 'selected' : 'other', name: 'Plugin', author: '' } ],
				] )
			),
		} )
		.get( '/wpcom/v2/marketplace/products' )
		.query( true )
		.reply( 200, { results: {} } );
	nock( 'https://api.wordpress.org' ).get( '/plugins/info/1.2/' ).query( true ).reply( 200, {} );
	const pluginRequests: string[] = [];
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( /\/rest\/v1\.2\/sites\/\d+\/plugins\/selected/ )
		.query( true )
		.reply( status, ( uri ) => {
			pluginRequests.push( uri );
			return { action_links: { Settings: 'https://site-1.example/plugin-settings' } };
		} );

	render( <PluginSummary slug="selected" /> );
	await waitFor( () => expect( screen.getByText( `Installed: ${ installed }` ) ).toBeVisible() );
	expect( screen.getByText( `Available: ${ 100 - installed }` ) ).toBeVisible();
	expect( pluginRequests ).toHaveLength( installed );
	const expectedSettingsLink =
		status === 200
			? 'https://site-1.example/plugin-settings'
			: 'https://site-1.example/wp-admin/plugins.php';
	const expectedFirstLink = installed ? expectedSettingsLink : undefined;
	expect( screen.queryByRole( 'link', { name: 'Site 1' } )?.getAttribute( 'href' ) ).toBe(
		expectedFirstLink
	);
} );
