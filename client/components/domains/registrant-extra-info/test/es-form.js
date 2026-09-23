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
const agreementLabel = /I have read and agree to the/;
const agreementLinkText = 'Red.es terms and conditions';
const agreementUrl = 'https://example.com/red-es-terms-and-conditions';

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

	test( 'shows Required while the Red.es agreement is unchecked', () => {
		render(
			<RegistrantExtraInfoEsForm
				{ ...mockProps }
				ccTldDetails={ { redEsAgreementAccepted: false } }
			/>
		);

		expect( screen.getByRole( 'checkbox', { name: agreementLabel } ) ).not.toBeChecked();
		expect( screen.getByText( 'Required' ) ).toBeVisible();
	} );

	test( 'hides the Red.es agreement error once checked', () => {
		render(
			<RegistrantExtraInfoEsForm
				{ ...mockProps }
				ccTldDetails={ { redEsAgreementAccepted: true } }
			/>
		);

		expect( screen.getByRole( 'checkbox', { name: agreementLabel } ) ).toBeChecked();
		expect( screen.queryByText( 'Required' ) ).not.toBeInTheDocument();
	} );

	test( 'renders the backend Red.es agreement error instead of Required', () => {
		render(
			<RegistrantExtraInfoEsForm
				{ ...mockProps }
				ccTldDetails={ { redEsAgreementAccepted: false } }
				contactDetailsValidationErrors={ {
					extra: {
						es: {
							redEsAgreementAccepted: 'Please review and accept the Red.es terms and conditions.',
						},
					},
				} }
			/>
		);

		expect(
			screen.getByText( 'Please review and accept the Red.es terms and conditions.' )
		).toBeVisible();
		expect( screen.queryByText( 'Required' ) ).not.toBeInTheDocument();
	} );

	test( 'sends the Red.es agreement acceptance when checked', async () => {
		const onContactDetailsChange = jest.fn();
		render(
			<RegistrantExtraInfoEsForm
				{ ...mockProps }
				ccTldDetails={ { redEsAgreementAccepted: false } }
				onContactDetailsChange={ onContactDetailsChange }
			/>
		);

		await userEvent.click( screen.getByRole( 'checkbox', { name: agreementLabel } ) );

		expect( onContactDetailsChange ).toHaveBeenLastCalledWith( {
			extra: { es: { redEsAgreementAccepted: true } },
		} );
	} );

	test( 'links the Red.es terms in a new tab', () => {
		render( <RegistrantExtraInfoEsForm { ...mockProps } /> );

		const link = screen.getByRole( 'link', { name: agreementLinkText } );
		expect( link ).toHaveAttribute( 'href', agreementUrl );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'noopener noreferrer' );
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

	test( 'does not overwrite a provided Red.es agreement value on mount', () => {
		const onContactDetailsChange = jest.fn();
		render(
			<RegistrantExtraInfoEsForm
				{ ...mockProps }
				ccTldDetails={ { redEsAgreementAccepted: true } }
				onContactDetailsChange={ onContactDetailsChange }
			/>
		);

		expect( onContactDetailsChange ).not.toHaveBeenCalled();
	} );
} );
