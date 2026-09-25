/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { translate } from 'i18n-calypso';
import { RegistrantExtraInfoEsForm } from '../es-form';

const mockProps = {
	translate,
	onContactDetailsChange: () => {},
	contactDetails: {},
	ccTldDetails: {},
	contactDetailsValidationErrors: {},
};

const entityTypeLabel = 'Choose the option that best describes the domain owner:';
const registrantIdLabel = 'Domain owner identification number';
const adminIdLabel = 'Contact person identification number (NIF or NIE)';
const noticeText = /Red.es requires the administrative and technical contact/;
const agreementLabel = 'I have read and agree to the Red.es agreement.';

describe( 'es-form', () => {
	test( 'renders the entity type select and the registrant ID for empty details', () => {
		render( <RegistrantExtraInfoEsForm { ...mockProps } /> );

		expect( screen.getByLabelText( entityTypeLabel ) ).toBeVisible();
		expect( screen.getByRole( 'combobox' ) ).toHaveValue( '' );
		expect( screen.getByLabelText( registrantIdLabel ) ).toBeVisible();
		expect( screen.queryByLabelText( adminIdLabel ) ).not.toBeInTheDocument();
		expect( screen.queryByText( noticeText ) ).not.toBeInTheDocument();
	} );

	test( 'renders the form regardless of the registrant country', () => {
		render(
			<RegistrantExtraInfoEsForm { ...mockProps } contactDetails={ { countryCode: 'ES' } } />
		);

		expect( screen.getByLabelText( entityTypeLabel ) ).toBeVisible();
	} );

	test( 'lists Individual first in the entity type options', () => {
		render( <RegistrantExtraInfoEsForm { ...mockProps } /> );

		const options = screen.getAllByRole( 'option' );
		expect( options[ 0 ] ).toHaveTextContent( 'Select an option' );
		expect( options[ 0 ] ).toBeDisabled();
		expect( options[ 1 ] ).toHaveTextContent( 'Individual' );
		expect( options[ 1 ] ).toHaveValue( '1' );
		expect( options ).toHaveLength( 39 );
	} );

	test( 'hides the admin ID and the notice for an individual', () => {
		render(
			<RegistrantExtraInfoEsForm { ...mockProps } ccTldDetails={ { registrantEntityType: '1' } } />
		);

		expect( screen.getByRole( 'combobox' ) ).toHaveValue( '1' );
		expect( screen.getByLabelText( registrantIdLabel ) ).toBeVisible();
		expect( screen.queryByLabelText( adminIdLabel ) ).not.toBeInTheDocument();
		expect( screen.queryByText( noticeText ) ).not.toBeInTheDocument();
	} );

	test( 'shows the admin ID and the notice for a company', () => {
		render(
			<RegistrantExtraInfoEsForm
				{ ...mockProps }
				ccTldDetails={ { registrantEntityType: '612' } }
			/>
		);

		expect( screen.getByRole( 'combobox' ) ).toHaveValue( '612' );
		expect( screen.getByLabelText( registrantIdLabel ) ).toBeVisible();
		expect( screen.getByLabelText( adminIdLabel ) ).toBeVisible();
		expect( screen.getByText( noticeText ) ).toBeVisible();
	} );

	test( 'renders the validation error for each field', () => {
		render(
			<RegistrantExtraInfoEsForm
				{ ...mockProps }
				ccTldDetails={ { registrantEntityType: '612' } }
				contactDetailsValidationErrors={ {
					extra: {
						es: {
							registrantEntityType: 'Test entity type error.',
							registrantIdentificationNumber: 'Test registrant ID error.',
							adminIdentificationNumber: 'Test admin ID error.',
						},
					},
				} }
			/>
		);

		expect( screen.getByText( 'Test entity type error.' ) ).toBeVisible();
		expect( screen.getByText( 'Test registrant ID error.' ) ).toBeVisible();
		expect( screen.getByText( 'Test admin ID error.' ) ).toBeVisible();
	} );

	test( 'sends the selected entity type', async () => {
		const onContactDetailsChange = jest.fn();
		render(
			<RegistrantExtraInfoEsForm
				{ ...mockProps }
				onContactDetailsChange={ onContactDetailsChange }
			/>
		);

		await userEvent.selectOptions( screen.getByRole( 'combobox' ), '612' );

		expect( onContactDetailsChange ).toHaveBeenCalledWith( {
			extra: { es: { registrantEntityType: '612' } },
		} );
	} );

	test( 'uppercases the identification numbers before sending them', () => {
		const onContactDetailsChange = jest.fn();
		render(
			<RegistrantExtraInfoEsForm
				{ ...mockProps }
				ccTldDetails={ { registrantEntityType: '612' } }
				onContactDetailsChange={ onContactDetailsChange }
			/>
		);

		fireEvent.change( screen.getByLabelText( registrantIdLabel ), {
			target: { value: 'b12345678' },
		} );
		expect( onContactDetailsChange ).toHaveBeenLastCalledWith( {
			extra: { es: { registrantIdentificationNumber: 'B12345678' } },
		} );

		fireEvent.change( screen.getByLabelText( adminIdLabel ), {
			target: { value: 'x1234567l' },
		} );
		expect( onContactDetailsChange ).toHaveBeenLastCalledWith( {
			extra: { es: { adminIdentificationNumber: 'X1234567L' } },
		} );
	} );

	test( 'renders the Red.es agreement checkbox for an individual', () => {
		render(
			<RegistrantExtraInfoEsForm { ...mockProps } ccTldDetails={ { registrantEntityType: '1' } } />
		);

		expect( screen.getByRole( 'checkbox', { name: agreementLabel } ) ).toBeVisible();
	} );

	test( 'renders the Red.es agreement checkbox for a company', () => {
		render(
			<RegistrantExtraInfoEsForm
				{ ...mockProps }
				ccTldDetails={ { registrantEntityType: '612' } }
			/>
		);

		expect( screen.getByRole( 'checkbox', { name: agreementLabel } ) ).toBeVisible();
	} );

	test( 'seeds the Red.es agreement as not accepted on mount when absent', () => {
		const onContactDetailsChange = jest.fn();
		render(
			<RegistrantExtraInfoEsForm
				{ ...mockProps }
				ccTldDetails={ { registrantEntityType: '612' } }
				onContactDetailsChange={ onContactDetailsChange }
			/>
		);

		expect( onContactDetailsChange ).toHaveBeenCalledTimes( 1 );
		expect( onContactDetailsChange ).toHaveBeenCalledWith( {
			extra: { es: { redEsAgreementAccepted: false } },
		} );
	} );

	test( 'resets a cached Red.es agreement acceptance on mount', () => {
		const onContactDetailsChange = jest.fn();
		render(
			<RegistrantExtraInfoEsForm
				{ ...mockProps }
				ccTldDetails={ { redEsAgreementAccepted: true } }
				onContactDetailsChange={ onContactDetailsChange }
			/>
		);

		expect( onContactDetailsChange ).toHaveBeenCalledTimes( 1 );
		expect( onContactDetailsChange ).toHaveBeenCalledWith( {
			extra: { es: { redEsAgreementAccepted: false, redEsAgreementVersion: '' } },
		} );
	} );

	test( 'passes the .es domains to the Red.es agreement', async () => {
		render(
			<RegistrantExtraInfoEsForm
				{ ...mockProps }
				contactDetails={ { firstName: 'Lucía', lastName: 'García' } }
				ccTldDetails={ {
					registrantEntityType: '1',
					registrantIdentificationNumber: '12345678Z',
				} }
				domainNames={ [ 'example.es' ] }
			/>
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Read the agreement' } ) );

		expect( screen.getByRole( 'dialog' ) ).toHaveTextContent( 'nombre de dominio example.es' );
	} );
} );
