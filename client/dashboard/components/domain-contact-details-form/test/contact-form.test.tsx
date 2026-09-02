/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import ContactForm from '../contact-form';
import type { DomainContactDetails } from '@automattic/api-core';

type ContactFormProps = React.ComponentProps< typeof ContactForm >;

const frIndividualContact: DomainContactDetails = {
	firstName: 'Marie',
	lastName: 'Merceron',
	organization: '',
	email: 'marie@example.com',
	phone: '+33.612345678',
	countryCode: 'FR',
	address1: '1 rue de la Paix',
	address2: '',
	city: 'Paris',
	state: '',
	postalCode: '75001',
	fax: '',
	optOutTransferLock: false,
	extra: { fr: { registrantType: 'individual' } },
};

const alwaysValid = jest.fn( () =>
	Promise.resolve( { success: true } )
) as unknown as ContactFormProps[ 'validate' ];

describe( '<ContactForm>', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.get( ( uri ) => uri.startsWith( '/rest/v1.1/domains/supported-countries' ) )
			.reply( 200, [ { code: 'FR', name: 'France' } ] )
			.get( ( uri ) => uri.startsWith( '/rest/v1.1/domains/supported-states/' ) )
			.reply( 200, [] )
			.get( ( uri ) => uri.startsWith( '/rest/v1.1/meta/sms-country-codes/' ) )
			.reply( 200, [
				{ code: 'FR', country_name: 'France', name: 'France (+33)', numeric_code: '+33' },
			] );
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'lifts the .fr individual organization error once the registrant becomes an organization', async () => {
		const user = userEvent.setup();

		render(
			<ContactForm
				initialData={ frIndividualContact }
				domainNames={ [ 'example.fr' ] }
				isSubmitting={ false }
				onSubmit={ jest.fn() }
				validate={ alwaysValid }
			/>
		);

		const save = await screen.findByRole( 'button', { name: 'Save' } );

		// An individual typing an organization back in is blocked.
		await user.type(
			await screen.findByRole( 'textbox', { name: 'Organization (Optional)' } ),
			'Acme'
		);
		expect(
			await screen.findByText( /An individual \.fr registrant cannot have an organization/ )
		).toBeVisible();
		expect( save ).toBeDisabled();

		// Resolving it from the other side — the registrant type, not the
		// organization — must lift the error even though the organization value
		// itself is untouched.
		await user.selectOptions(
			screen.getByRole( 'combobox', { name: "Who's this domain for?" } ),
			'organization'
		);

		await waitFor(
			() => {
				expect(
					screen.queryByText( /An individual \.fr registrant cannot have an organization/ )
				).not.toBeInTheDocument();
				expect( save ).toBeEnabled();
			},
			{ timeout: 3000 }
		);
	} );
} );
