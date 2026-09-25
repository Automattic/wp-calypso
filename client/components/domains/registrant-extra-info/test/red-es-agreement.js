/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RedEsAgreement from '../red-es-agreement';
import { RED_ES_AGREEMENT_VERSION } from '../red-es-agreement-text';

const individualContactDetails = { firstName: 'Lucía', lastName: 'García' };
const individualCcTldDetails = {
	registrantEntityType: '1',
	registrantIdentificationNumber: '12345678Z',
};
const companyContactDetails = {
	firstName: 'Lucía',
	lastName: 'García',
	organization: 'Ejemplo SL',
};
const companyCcTldDetails = {
	registrantEntityType: '612',
	registrantIdentificationNumber: 'B12345678',
	adminIdentificationNumber: 'X1234567L',
};

const defaultProps = {
	contactDetails: individualContactDetails,
	ccTldDetails: individualCcTldDetails,
	domainNames: [ 'example.es' ],
	onContactDetailsChange: () => {},
	contactDetailsValidationErrors: {},
};

const checkboxName = 'I have read and agree to the Red.es agreement.';
const linkName = 'Read the agreement';
const helperText = 'Fill in the details above to read and accept the Red.es agreement.';

function renderAgreement( props = {} ) {
	const allProps = { ...defaultProps, ...props };
	const result = render( <RedEsAgreement { ...allProps } /> );
	return {
		...result,
		rerenderAgreement: ( newProps ) =>
			result.rerender( <RedEsAgreement { ...allProps } { ...newProps } /> ),
	};
}

async function openAgreement() {
	await userEvent.click( screen.getByRole( 'button', { name: linkName } ) );
	return screen.getByRole( 'dialog' );
}

async function switchLanguage( dialog, name ) {
	await userEvent.click( within( dialog ).getByRole( 'button', { name } ) );
}

const englishButtonName = 'English version – for information only';

describe( 'RedEsAgreement', () => {
	describe( 'gating', () => {
		test.each( [
			[ 'the first name', { contactDetails: { lastName: 'García' } } ],
			[ 'the last name', { contactDetails: { firstName: 'Lucía' } } ],
			[ 'the entity type', { ccTldDetails: { registrantIdentificationNumber: '12345678Z' } } ],
			[ 'the owner ID', { ccTldDetails: { registrantEntityType: '1' } } ],
			[ 'the domains', { domainNames: [] } ],
			[
				'the organization of a company',
				{
					contactDetails: { firstName: 'Lucía', lastName: 'García' },
					ccTldDetails: companyCcTldDetails,
				},
			],
			[
				'the contact person ID of a company',
				{
					contactDetails: companyContactDetails,
					ccTldDetails: { ...companyCcTldDetails, adminIdentificationNumber: '' },
				},
			],
		] )( 'disables the checkbox and the link without %s', ( _, props ) => {
			renderAgreement( props );

			expect( screen.getByRole( 'checkbox', { name: checkboxName } ) ).toBeDisabled();
			expect( screen.getByRole( 'button', { name: linkName } ) ).toHaveAttribute(
				'aria-disabled',
				'true'
			);
			expect( screen.getByText( helperText ) ).toBeVisible();
		} );

		test.each( [
			[ 'an individual', {} ],
			[ 'a company', { contactDetails: companyContactDetails, ccTldDetails: companyCcTldDetails } ],
		] )( 'enables the checkbox and the link for %s with every detail', ( _, props ) => {
			renderAgreement( props );

			expect( screen.getByRole( 'checkbox', { name: checkboxName } ) ).toBeEnabled();
			expect( screen.getByRole( 'button', { name: linkName } ) ).not.toHaveAttribute(
				'aria-disabled'
			);
			expect( screen.queryByText( helperText ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'document', () => {
		test( 'shows the interpolated Spanish document by default', async () => {
			renderAgreement();

			const dialog = await openAgreement();

			expect(
				within( dialog ).getByRole( 'heading', {
					name: 'Anexo III del Contrato de Agente Registrador',
				} )
			).toBeVisible();
			expect( dialog ).toHaveTextContent(
				'Lucía García, como solicitante del nombre de dominio example.es'
			);
			expect( dialog ).toHaveTextContent( 'D./Dña. Lucía García, con DNI/pasaporte 12345678Z' );
			expect( dialog.querySelector( '[lang="es"]' ) ).toBeVisible();
		} );

		test( 'switches to the English version for information and back', async () => {
			renderAgreement();
			const dialog = await openAgreement();

			await switchLanguage( dialog, englishButtonName );

			expect(
				within( dialog ).getByRole( 'heading', { name: 'Annex III of the Registrar Contract' } )
			).toBeVisible();
			expect( dialog ).toHaveTextContent( 'This English translation is provided for convenience' );
			expect( dialog ).toHaveTextContent(
				'Lucía García, as applicant for the domain name example.es'
			);
			expect( dialog.querySelector( '[lang="en"]' ) ).toBeVisible();

			await switchLanguage( dialog, 'Spanish version' );

			expect( dialog ).toHaveTextContent( 'como solicitante del nombre de dominio' );
		} );

		test( 'reopens in Spanish after reading the English version', async () => {
			renderAgreement();
			const dialog = await openAgreement();
			await switchLanguage( dialog, englishButtonName );
			await userEvent.click( within( dialog ).getByRole( 'button', { name: 'Close' } ) );
			await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );

			const reopened = await openAgreement();

			expect( reopened ).toHaveTextContent( 'como solicitante del nombre de dominio' );
		} );

		test( 'shows the organization and the contact person ID for a company', async () => {
			renderAgreement( {
				contactDetails: companyContactDetails,
				ccTldDetails: companyCcTldDetails,
			} );

			const dialog = await openAgreement();

			expect( dialog ).toHaveTextContent( 'Ejemplo SL, como solicitante del nombre de dominio' );
			expect( dialog ).toHaveTextContent( 'D./Dña. Lucía García, con DNI/pasaporte X1234567L' );
		} );

		test( 'ignores a leftover contact person ID for an individual', async () => {
			renderAgreement( {
				ccTldDetails: { ...individualCcTldDetails, adminIdentificationNumber: 'X1234567L' },
			} );

			const dialog = await openAgreement();

			expect( dialog ).toHaveTextContent( 'D./Dña. Lucía García, con DNI/pasaporte 12345678Z' );
		} );

		test( 'lists every .es domain', async () => {
			renderAgreement( { domainNames: [ 'example.es', 'ejemplo.es' ] } );

			const dialog = await openAgreement();

			expect( dialog ).toHaveTextContent(
				'como solicitante del nombre de dominio example.es, ejemplo.es'
			);
		} );

		test( 'escapes the interpolated values', async () => {
			renderAgreement( { contactDetails: { firstName: '<b>Lucía</b>', lastName: 'García' } } );

			const dialog = await openAgreement();

			expect( dialog ).toHaveTextContent( '<b>Lucía</b> García, como solicitante' );
			expect( dialog.querySelector( 'b' ) ).toBeNull();
		} );
	} );

	describe( 'acceptance', () => {
		test( 'sends the acceptance and the version when ticked', async () => {
			const onContactDetailsChange = jest.fn();
			renderAgreement( { onContactDetailsChange } );

			await userEvent.click( screen.getByRole( 'checkbox', { name: checkboxName } ) );

			expect( onContactDetailsChange ).toHaveBeenLastCalledWith( {
				extra: {
					es: { redEsAgreementAccepted: true, redEsAgreementVersion: RED_ES_AGREEMENT_VERSION },
				},
			} );
		} );

		test( 'clears the acceptance and the version when unticked', async () => {
			const onContactDetailsChange = jest.fn();
			const { rerenderAgreement } = renderAgreement( { onContactDetailsChange } );
			await userEvent.click( screen.getByRole( 'checkbox', { name: checkboxName } ) );
			rerenderAgreement( {
				ccTldDetails: {
					...individualCcTldDetails,
					redEsAgreementAccepted: true,
					redEsAgreementVersion: RED_ES_AGREEMENT_VERSION,
				},
			} );

			await userEvent.click( screen.getByRole( 'checkbox', { name: checkboxName } ) );

			expect( onContactDetailsChange ).toHaveBeenLastCalledWith( {
				extra: { es: { redEsAgreementAccepted: false, redEsAgreementVersion: '' } },
			} );
		} );

		test( 'resets the acceptance when an interpolated value changes', async () => {
			const onContactDetailsChange = jest.fn();
			const { rerenderAgreement } = renderAgreement( { onContactDetailsChange } );
			await userEvent.click( screen.getByRole( 'checkbox', { name: checkboxName } ) );
			const acceptedCcTldDetails = {
				...individualCcTldDetails,
				redEsAgreementAccepted: true,
				redEsAgreementVersion: RED_ES_AGREEMENT_VERSION,
			};
			rerenderAgreement( { ccTldDetails: acceptedCcTldDetails } );
			expect( onContactDetailsChange ).toHaveBeenCalledTimes( 1 );

			rerenderAgreement( {
				ccTldDetails: acceptedCcTldDetails,
				contactDetails: { ...individualContactDetails, firstName: 'Lucia' },
			} );

			expect( onContactDetailsChange ).toHaveBeenLastCalledWith( {
				extra: { es: { redEsAgreementAccepted: false, redEsAgreementVersion: '' } },
			} );
		} );

		test( 'keeps the acceptance when an unrelated detail changes', async () => {
			const onContactDetailsChange = jest.fn();
			const { rerenderAgreement } = renderAgreement( { onContactDetailsChange } );
			await userEvent.click( screen.getByRole( 'checkbox', { name: checkboxName } ) );
			const acceptedCcTldDetails = {
				...individualCcTldDetails,
				redEsAgreementAccepted: true,
				redEsAgreementVersion: RED_ES_AGREEMENT_VERSION,
			};

			rerenderAgreement( {
				ccTldDetails: acceptedCcTldDetails,
				contactDetails: { ...individualContactDetails, city: 'Madrid' },
			} );

			expect( onContactDetailsChange ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'resets an acceptance that was not ticked in this session', () => {
			const onContactDetailsChange = jest.fn();
			renderAgreement( {
				onContactDetailsChange,
				ccTldDetails: { ...individualCcTldDetails, redEsAgreementAccepted: true },
			} );

			expect( onContactDetailsChange ).toHaveBeenCalledWith( {
				extra: { es: { redEsAgreementAccepted: false, redEsAgreementVersion: '' } },
			} );
		} );
	} );

	describe( 'errors', () => {
		test( 'shows Required while unticked', () => {
			renderAgreement();

			expect( screen.getByText( 'Required' ) ).toBeVisible();
		} );

		test( 'renders the backend errors instead of Required', () => {
			renderAgreement( {
				contactDetailsValidationErrors: {
					extra: {
						es: {
							redEsAgreementAccepted: 'Please accept the Red.es agreement.',
							redEsAgreementVersion: 'Invalid agreement version.',
						},
					},
				},
			} );

			expect( screen.getByText( 'Please accept the Red.es agreement.' ) ).toBeVisible();
			expect( screen.getByText( 'Invalid agreement version.' ) ).toBeVisible();
			expect( screen.queryByText( 'Required' ) ).not.toBeInTheDocument();
		} );
	} );
} );
