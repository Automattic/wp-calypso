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
			.reply( 200, [
				{ code: 'FR', name: 'France' },
				{ code: 'CA', name: 'Canada' },
			] )
			.get( ( uri ) => uri.startsWith( '/rest/v1.1/domains/supported-states/CA' ) )
			.reply( 200, [
				{ code: 'AB', name: 'Alberta' },
				{ code: 'BC', name: 'British Columbia' },
			] )
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

	test( 'clears a state that does not belong to the selected country instead of substituting one', async () => {
		render(
			<ContactForm
				initialData={ {
					...frIndividualContact,
					countryCode: 'CA',
					city: 'Grande Prairie',
					state: 'XX',
					postalCode: 'T8V 7S1',
					extra: {},
				} }
				domainNames={ [ 'example.com' ] }
				isSubmitting={ false }
				onSubmit={ jest.fn() }
				validate={ alwaysValid }
			/>
		);

		const provinceSelect = await screen.findByRole( 'combobox', { name: 'Select Province' } );
		expect( await screen.findByRole( 'option', { name: 'Alberta' } ) ).toBeVisible();
		expect( provinceSelect ).toHaveValue( '' );
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

	test( 'requires an organization name once the .fr registrant becomes an organization', async () => {
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
		const registrantType = screen.getByRole( 'combobox', { name: "Who's this domain for?" } );

		await user.selectOptions( registrantType, 'organization' );

		expect( await screen.findByRole( 'textbox', { name: 'Organization' } ) ).toBeVisible();
		expect(
			await screen.findByText( /Enter the name of the company or organization/ )
		).toBeVisible();
		expect( save ).toBeDisabled();

		await user.type( screen.getByRole( 'textbox', { name: 'Organization' } ), 'Acme' );

		await waitFor(
			() => {
				expect(
					screen.queryByText( /Enter the name of the company or organization/ )
				).not.toBeInTheDocument();
				expect( save ).toBeEnabled();
			},
			{ timeout: 3000 }
		);
	} );

	test( 'lifts the .fr organization requirement once the registrant becomes an individual', async () => {
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
		const registrantType = screen.getByRole( 'combobox', { name: "Who's this domain for?" } );

		// Typing and clearing the organization while it is required records a
		// `required` failure against it, which must not outlive the requirement.
		await user.selectOptions( registrantType, 'organization' );
		const organization = await screen.findByRole( 'textbox', { name: 'Organization' } );
		await user.type( organization, 'Acme' );
		await user.clear( organization );
		await user.selectOptions( registrantType, 'individual' );
		// Back where it started, the form is no longer dirty; edit something else.
		await user.type( screen.getByRole( 'textbox', { name: 'First name' } ), 'x' );

		expect(
			await screen.findByRole( 'textbox', { name: 'Organization (Optional)' } )
		).toBeVisible();
		await waitFor(
			() => {
				expect(
					screen.queryByText( /Enter the name of the company or organization/ )
				).not.toBeInTheDocument();
				expect( save ).toBeEnabled();
			},
			{ timeout: 3000 }
		);
	} );

	// Regression test for DOMENG-1172: the registry rejects address lines shorter
	// than two characters, so the form must catch them before submission.
	test( 'blocks saving when a required address line is a single character', async () => {
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
		const address1 = await screen.findByRole( 'textbox', { name: 'Address' } );

		await user.clear( address1 );
		await user.type( address1, 'a' );
		// Blur the field so its validation message is revealed.
		await user.tab();

		expect( await screen.findByText( 'Value is too short.' ) ).toBeVisible();
		await waitFor( () => expect( save ).toBeDisabled(), { timeout: 3000 } );

		await user.type( address1, 'b' );

		await waitFor(
			() => {
				expect( screen.queryByText( 'Value is too short.' ) ).not.toBeInTheDocument();
				expect( save ).toBeEnabled();
			},
			{ timeout: 3000 }
		);
	} );

	// The second address line is optional, so an empty value must stay valid while
	// a single character is still rejected. Start from a non-empty line 2 so that
	// clearing it is still an edit (Save is gated on the form being dirty).
	test( 'keeps an empty second address line valid but rejects a single character', async () => {
		const user = userEvent.setup();

		render(
			<ContactForm
				initialData={ { ...frIndividualContact, address2: 'Second floor' } }
				domainNames={ [ 'example.fr' ] }
				isSubmitting={ false }
				onSubmit={ jest.fn() }
				validate={ alwaysValid }
			/>
		);

		const save = await screen.findByRole( 'button', { name: 'Save' } );
		const address2 = await screen.findByRole( 'textbox', { name: /Address line 2/ } );

		await user.clear( address2 );
		await user.type( address2, 'a' );
		// Blur the field so its validation message is revealed.
		await user.tab();

		expect( await screen.findByText( 'Value is too short.' ) ).toBeVisible();
		await waitFor( () => expect( save ).toBeDisabled(), { timeout: 3000 } );

		// Clearing it back to empty is valid — the field is optional — so saving is
		// unblocked even though line 2 is now blank.
		await user.clear( address2 );

		await waitFor(
			() => {
				expect( screen.queryByText( 'Value is too short.' ) ).not.toBeInTheDocument();
				expect( save ).toBeEnabled();
			},
			{ timeout: 3000 }
		);
	} );
} );
