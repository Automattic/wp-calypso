import nock from 'nock';
import {
	validateDomainContactInformation,
	validateGoogleWorkspaceContactInformation,
} from '../me-domain-contact-information';
import { validateSignupUser } from '../signups-validation-user';

const BASE = 'https://public-api.wordpress.com';

describe( 'contact validation', () => {
	afterEach( () => nock.cleanAll() );

	test( 'validates domain contact details against v1.2', async () => {
		let body: Record< string, unknown > | undefined;
		nock( BASE )
			.post( '/rest/v1.2/me/domain-contact-information/validate', ( requestBody ) => {
				body = requestBody;
				return true;
			} )
			.reply( 200, {
				success: false,
				messages: { 'extra.ca.lang': [ 'Required' ] },
				messages_simple: [ 'Required' ],
			} );

		const result = await validateDomainContactInformation( { first_name: 'Ada' }, [
			'example.ca',
		] );

		expect( body ).toEqual( {
			contact_information: { first_name: 'Ada' },
			domain_names: [ 'example.ca' ],
		} );
		expect( result ).toEqual( {
			success: false,
			messages: { 'extra.ca.lang': [ 'Required' ] },
			messages_simple: [ 'Required' ],
		} );
	} );

	test( 'validates Google Workspace contact details', async () => {
		const scope = nock( BASE )
			.post( '/rest/v1.1/me/google-apps/validate' )
			.reply( 200, { success: true } );

		await expect(
			validateGoogleWorkspaceContactInformation( { first_name: 'Ada' }, [ 'example.com' ] )
		).resolves.toEqual( { success: true } );
		expect( scope.isDone() ).toBe( true );
	} );

	test( 'validates a signup email with its locale in the body', async () => {
		let body: Record< string, unknown > | undefined;
		nock( BASE )
			.post( '/rest/v1.1/signups/validation/user/', ( requestBody ) => {
				body = requestBody;
				return true;
			} )
			.reply( 200, { success: true } );

		await validateSignupUser( {
			email: 'ada@example.com',
			locale: 'fr',
			is_from_registrationless_checkout: true,
		} );

		expect( body ).toEqual( {
			email: 'ada@example.com',
			locale: 'fr',
			is_from_registrationless_checkout: true,
		} );
	} );
} );
