/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { RegistrantExtraInfoInForm } from '../in-form';

const mockProps = {
	translate: ( string ) => string,
	updateContactDetailsCache: () => {},
	onContactDetailsChange: () => {},
	ccTldDetails: {},
	contactDetailsValidationErrors: {},
};

describe( 'in-form', () => {
	test( 'renders the nexus fields for a non-Indian registrant', () => {
		const testProps = {
			...mockProps,
			contactDetails: { countryCode: 'US' },
		};

		render( <RegistrantExtraInfoInForm { ...testProps } /> );

		expect(
			screen.getByText( 'Choose the option that best describes your connection to India:' )
		).toBeVisible();
		expect( screen.getByRole( 'combobox' ) ).toBeVisible();
		expect( screen.getByRole( 'checkbox' ) ).toBeVisible();
	} );

	test( 'renders nothing for an Indian registrant', () => {
		const testProps = {
			...mockProps,
			contactDetails: { countryCode: 'IN' },
		};

		render( <RegistrantExtraInfoInForm { ...testProps } /> );

		expect(
			screen.queryByText( 'Choose the option that best describes your connection to India:' )
		).not.toBeInTheDocument();
		expect( screen.queryByRole( 'combobox' ) ).not.toBeInTheDocument();
	} );

	test( 'renders nothing when no country has been selected yet', () => {
		const testProps = {
			...mockProps,
			contactDetails: {},
		};

		render( <RegistrantExtraInfoInForm { ...testProps } /> );

		expect( screen.queryByRole( 'combobox' ) ).not.toBeInTheDocument();
	} );

	test( 'renders the connection type validation error', () => {
		const testProps = {
			...mockProps,
			contactDetails: { countryCode: 'US' },
			ccTldDetails: { nexusDeclaration: true },
			contactDetailsValidationErrors: {
				extra: {
					in: {
						nexusConnectionType: 'Test connection type error.',
					},
				},
			},
		};

		render( <RegistrantExtraInfoInForm { ...testProps } /> );

		expect( screen.getByText( 'Test connection type error.' ) ).toBeVisible();
	} );
} );
