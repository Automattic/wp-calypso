/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import Snackbars from '../../../../app/snackbars';
import { render } from '../../../../test-utils';
import { getReferralConfig } from '../config';
import ReferHostingForm from '../form';

const API = 'https://public-api.wordpress.com';

function mockCountries() {
	nock( API )
		.persist()
		.get( '/wpcom/v2/woocommerce/countries/regions/' )
		.query( true )
		.reply( 200, {
			FR: 'France',
			US: 'United States (US)',
			'US:TX': 'United States (US) — Texas',
		} );
}

// Typing every field keystroke by keystroke is too slow for CI, so the text
// fields get their value in one change event each. Label lookups cost ~1ms
// here against ~25ms for the equivalent role lookup.
function fillText( name: string, value: string ) {
	fireEvent.change( screen.getByLabelText( name ), { target: { value } } );
}

async function fillSharedFields( user: ReturnType< typeof userEvent.setup > ) {
	fillText( 'Company name', 'Acme' );
	fillText( 'Company address', '1 Main St' );
	await user.click( screen.getByRole( 'combobox', { name: 'Country' } ) );
	await user.click( await screen.findByRole( 'option', { name: 'France' } ) );
	fillText( 'City', 'Paris' );
	fillText( 'ZIP/Postal code', '75001' );
	fillText( 'First name', 'Ada' );
	fillText( 'Last name', 'Lovelace' );
	fillText( 'Title', 'CTO' );
	fillText( 'Email', 'ada@example.com' );
	fillText( 'Website', 'example.com' );
	fillText( 'Tell us more about this opportunity', 'A big site.' );
}

const sharedPayload = {
	agency_id: 1,
	company_name: 'Acme',
	address: '1 Main St',
	country_code: 'FR',
	state: '',
	city: 'Paris',
	zip: '75001',
	first_name: 'Ada',
	last_name: 'Lovelace',
	title: 'CTO',
	phone: '',
	email: 'ada@example.com',
	website: 'example.com',
	opportunity_description: 'A big site.',
};

describe( '<ReferHostingForm>', () => {
	beforeEach( () => {
		nock.cleanAll();
		mockCountries();
	} );

	test( 'shows the classic messages and does not submit while fields are missing', async () => {
		const user = userEvent.setup();
		const onSubmitted = jest.fn();
		const request = nock( API ).post( '/wpcom/v2/agency/vip/partner-opportunity' ).reply( 200 );

		render(
			<ReferHostingForm
				agencyId={ 1 }
				config={ getReferralConfig( 'enterprise' ) }
				onSubmitted={ onSubmitted }
			/>
		);
		fillText( 'Email', 'not-an-email' );
		await user.click( screen.getByRole( 'button', { name: 'Submit VIP referral' } ) );

		expect( await screen.findByText( 'Please enter your company name' ) ).toBeVisible();
		expect( screen.getByText( 'Please enter a valid email' ) ).toBeVisible();
		expect( screen.getByText( 'Please select a lead type' ) ).toBeVisible();
		expect( request.isDone() ).toBe( false );
		expect( onSubmitted ).not.toHaveBeenCalled();
	} );

	test( 'only asks for a state in the countries the form supports', async () => {
		const user = userEvent.setup();

		render(
			<ReferHostingForm
				agencyId={ 1 }
				config={ getReferralConfig( 'premium' ) }
				onSubmitted={ jest.fn() }
			/>
		);
		await screen.findByRole( 'combobox', { name: 'Country' } );
		expect( screen.queryByRole( 'combobox', { name: 'State' } ) ).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'combobox', { name: 'Country' } ) );
		await user.click( await screen.findByRole( 'option', { name: 'United States (US)' } ) );

		await user.click( screen.getByRole( 'combobox', { name: 'State' } ) );
		expect( await screen.findByRole( 'option', { name: 'Texas' } ) ).toBeVisible();
	} );

	test( 'clears the state when the country changes', async () => {
		const user = userEvent.setup();

		render(
			<ReferHostingForm
				agencyId={ 1 }
				config={ getReferralConfig( 'premium' ) }
				onSubmitted={ jest.fn() }
			/>
		);
		await user.click( await screen.findByRole( 'combobox', { name: 'Country' } ) );
		await user.click( await screen.findByRole( 'option', { name: 'United States (US)' } ) );
		await user.click( screen.getByRole( 'combobox', { name: 'State' } ) );
		await user.click( await screen.findByRole( 'option', { name: 'Texas' } ) );
		expect( screen.getByRole( 'combobox', { name: 'State' } ) ).toHaveValue( 'Texas' );

		await user.click( screen.getByRole( 'combobox', { name: 'Country' } ) );
		await user.click( await screen.findByRole( 'option', { name: 'France' } ) );
		expect( screen.queryByRole( 'combobox', { name: 'State' } ) ).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'combobox', { name: 'Country' } ) );
		await user.click( await screen.findByRole( 'option', { name: 'United States (US)' } ) );
		expect( screen.getByRole( 'combobox', { name: 'State' } ) ).toHaveValue( '' );
	} );

	test( 'keeps the form and shows an error when the referral fails to send', async () => {
		const user = userEvent.setup();
		const onSubmitted = jest.fn();
		nock( API )
			.post( '/wpcom/v2/agency/pressable/premium-plan-referral' )
			.reply( 500, { error: 'submission_failed', message: 'Nope' } );

		render(
			<>
				<ReferHostingForm
					agencyId={ 1 }
					config={ getReferralConfig( 'premium' ) }
					onSubmitted={ onSubmitted }
				/>
				<Snackbars />
			</>
		);
		await fillSharedFields( user );
		await user.click( screen.getByRole( 'button', { name: 'Submit Premium plan referral' } ) );

		// The message is also announced in the a11y live region, so read the snackbar itself.
		expect(
			await screen.findByText( 'Failed to submit referral.', {
				selector: '.components-snackbar__content',
			} )
		).toBeInTheDocument();
		expect( onSubmitted ).not.toHaveBeenCalled();
		expect( screen.getByRole( 'button', { name: 'Submit Premium plan referral' } ) ).toBeEnabled();
	} );

	test( 'sends the Enterprise referral with the lead type and RFP answer', async () => {
		const user = userEvent.setup();
		const onSubmitted = jest.fn();
		let body: unknown;
		const request = nock( API )
			.post( '/wpcom/v2/agency/vip/partner-opportunity', ( requestBody ) => {
				body = requestBody;
				return true;
			} )
			.reply( 200, { status: 'success', message: 'Form submitted successfully.' } );

		const { recordTracksEvent } = render(
			<ReferHostingForm
				agencyId={ 1 }
				config={ getReferralConfig( 'enterprise' ) }
				onSubmitted={ onSubmitted }
			/>
		);
		await fillSharedFields( user );
		await user.click( screen.getByRole( 'combobox', { name: 'Type of lead' } ) );
		await user.click( await screen.findByRole( 'option', { name: 'Public sector' } ) );
		await user.click( screen.getByRole( 'radio', { name: 'Yes' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Submit VIP referral' } ) );

		await waitFor( () => expect( onSubmitted ).toHaveBeenCalled() );
		expect( request.isDone() ).toBe( true );
		expect( body ).toEqual( { ...sharedPayload, lead_type: 'Public Sector', is_rfp: true } );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_marketplace_hosting_enterprise_refer_form_submit'
		);
	} );

	test( 'sends the Premium referral without the Enterprise-only fields', async () => {
		const user = userEvent.setup();
		const onSubmitted = jest.fn();
		let body: unknown;
		const request = nock( API )
			.post( '/wpcom/v2/agency/pressable/premium-plan-referral', ( requestBody ) => {
				body = requestBody;
				return true;
			} )
			.reply( 200, { status: 'success', message: 'Form submitted successfully.' } );

		const { recordTracksEvent } = render(
			<ReferHostingForm
				agencyId={ 1 }
				config={ getReferralConfig( 'premium' ) }
				onSubmitted={ onSubmitted }
			/>
		);
		expect( screen.queryByRole( 'combobox', { name: 'Type of lead' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'radio', { name: 'Yes' } ) ).not.toBeInTheDocument();

		await fillSharedFields( user );
		await user.click( screen.getByRole( 'button', { name: 'Submit Premium plan referral' } ) );

		await waitFor( () => expect( onSubmitted ).toHaveBeenCalled() );
		expect( request.isDone() ).toBe( true );
		expect( body ).toEqual( sharedPayload );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_marketplace_hosting_premium_refer_form_submit'
		);
	} );
} );
