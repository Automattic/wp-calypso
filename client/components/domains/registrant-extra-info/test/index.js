/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import RegistrantExtraInfoForm from '../index';

jest.mock( '../ca-form', () => () => <div data-testid="ca-form"></div> );
jest.mock( '../fr-form', () => () => <div data-testid="fr-form"></div> );
jest.mock( '../uk-form', () => () => <div data-testid="uk-form"></div> );

describe( 'Switcher Form', () => {
	test( 'should render correct form for fr', () => {
		render( <RegistrantExtraInfoForm tld="fr" /> );

		expect( screen.getByTestId( 'fr-form' ) ).toBeVisible();
		expect( screen.queryByTestId( 'ca-form' ) ).not.toBeInTheDocument();
	} );

	test( 'should render correct form for ca', () => {
		render( <RegistrantExtraInfoForm tld="ca" /> );

		expect( screen.getByTestId( 'ca-form' ) ).toBeVisible();
		expect( screen.queryByTestId( 'fr-form' ) ).not.toBeInTheDocument();
	} );

	test( 'should render correct form for uk', () => {
		render( <RegistrantExtraInfoForm tld="uk" /> );

		expect( screen.queryByTestId( 'ca-form' ) ).not.toBeInTheDocument();
		expect( screen.queryByTestId( 'fr-form' ) ).not.toBeInTheDocument();
		expect( screen.getByTestId( 'uk-form' ) ).toBeVisible();
	} );
} );
