/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { RegistrantExtraInfoCaForm } from '../ca-form';

const mockProps = {
	translate: ( string ) => string,
	updateContactDetailsCache: () => {},
	userWpcomLang: 'EN',
	getFieldProps: () => ( {} ),
};

describe( 'ca-form', () => {
	test( 'should render without errors when extra is empty', () => {
		const testProps = {
			...mockProps,
			contactDetails: {},
			ccTldDetails: {},
		};

		render( <RegistrantExtraInfoCaForm { ...testProps } /> );

		expect(
			screen.getByText( 'Choose the option that best describes your Canadian presence:' )
		).toBeVisible();
	} );
} );
