import page from '@automattic/calypso-router';
import { requireClientAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render } from 'calypso/controller';
import sections from 'calypso/sections';
import { clientPressableReturnContext } from '../controller';
import registerRoutes from '../index';

jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( 'calypso/a8c-for-agencies/controller', () => ( {
	requireClientAccessContext: jest.fn(),
	requireLegacyClientBillingContext: jest.fn(),
} ) );
jest.mock( 'calypso/controller', () => ( { makeLayout: jest.fn(), render: jest.fn() } ) );
jest.mock( '../controller', () => ( {
	clientLandingContext: jest.fn(),
	clientSubscriptionsContext: jest.fn(),
	clientPaymentMethodsContext: jest.fn(),
	clientPaymentMethodsAddContext: jest.fn(),
	clientInvoicesContext: jest.fn(),
	clientCheckoutContext: jest.fn(),
	clientCheckoutV2Context: jest.fn(),
	clientPressableReturnContext: jest.fn(),
} ) );

it( 'loads the client section for a direct Pressable return and registers its client access guard', () => {
	const section = sections.find( ( section ) => section.name === 'a8c-for-agencies-client' );
	expect( section ).toEqual(
		expect.objectContaining( {
			module: 'calypso/a8c-for-agencies/sections/client',
			paths: expect.arrayContaining( [ '/client/pressable-return' ] ),
		} )
	);
	expect( section?.enableLoggedOut ).not.toBe( true );
	registerRoutes();
	expect( page ).toHaveBeenCalledWith(
		'/client/pressable-return',
		requireClientAccessContext,
		clientPressableReturnContext,
		makeLayout,
		render
	);
} );
