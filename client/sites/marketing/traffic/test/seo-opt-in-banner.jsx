/** @jest-environment jsdom */
import { act, render, screen, waitFor } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import SeoOptInBanner from '../seo-opt-in-banner';

jest.mock( 'calypso/lib/wp', () => ( { req: { get: jest.fn() } } ) );
jest.mock( 'i18n-calypso', () => ( { useTranslate: () => ( value ) => value } ) );
jest.mock( 'calypso/components/notice', () => ( { children, text } ) => (
	<div>
		{ text }
		{ children }
	</div>
) );
jest.mock( 'calypso/components/notice/notice-action', () => ( { children, href } ) => (
	<a href={ href }>{ children }</a>
) );

afterEach( () => jest.clearAllMocks() );

test.each( [ true, false ] )(
	'offers discovery only when the site reports availability: %s',
	async ( available ) => {
		wpcom.req.get.mockResolvedValue( { data: { optin_available: available } } );
		render(
			<SeoOptInBanner
				siteId={ 123 }
				settingsUrl="https://example.com/wp-admin/admin.php?page=jetpack#/traffic"
			/>
		);
		await waitFor( () => expect( wpcom.req.get ).toHaveBeenCalledTimes( 1 ) );
		await waitFor( () =>
			expect( screen.queryAllByRole( 'link' ) ).toHaveLength( available ? 1 : 0 )
		);
		expect(
			screen.queryByRole( 'link', { name: 'Open Jetpack settings' } )?.getAttribute( 'href' )
		).toBe(
			available ? 'https://example.com/wp-admin/admin.php?page=jetpack#/traffic' : undefined
		);
	}
);

test( 'leaves legacy settings usable when an older plugin rejects the availability request', async () => {
	wpcom.req.get.mockRejectedValue( new Error( 'rest_no_route' ) );
	render( <SeoOptInBanner siteId={ 123 } settingsUrl="https://example.com/wp-admin/" /> );
	await waitFor( () => expect( wpcom.req.get ).toHaveBeenCalledTimes( 1 ) );
	expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
} );

test( 'does not offer the previous site when switching while a request is pending', async () => {
	let resolvePrevious;
	wpcom.req.get.mockImplementationOnce(
		() => new Promise( ( resolve ) => ( resolvePrevious = resolve ) )
	);
	wpcom.req.get.mockResolvedValue( { data: { optin_available: false } } );
	const { rerender } = render(
		<SeoOptInBanner siteId={ 123 } settingsUrl="https://example.com/wp-admin/" />
	);
	rerender( <SeoOptInBanner siteId={ 456 } settingsUrl="https://other.example/wp-admin/" /> );
	await act( async () => resolvePrevious( { data: { optin_available: true } } ) );
	expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
} );
