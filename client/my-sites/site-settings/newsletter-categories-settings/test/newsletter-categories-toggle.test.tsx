/**
 * @jest-environment jsdom
 */

import { render, fireEvent } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import NewsletterCategoriesToggle, {
	NEWSLETTER_CATEGORIES_ENABLED_OPTION,
} from '../newsletter-categories-toggle';

jest.mock( 'i18n-calypso' );

describe( 'NewsletterCategoriesToggle', () => {
	beforeEach( () => {
		( useTranslate as jest.Mock ).mockReturnValue( ( text: string ) => text );
	} );

	it( 'renders toggle control correctly with given value', () => {
		const mockHandleToggle = jest.fn();
		const { getByText } = render(
			<NewsletterCategoriesToggle value={ true } handleAutosavingToggle={ mockHandleToggle } />
		);

		expect( getByText( 'Enable newsletter categories' ) ).toBeInTheDocument();
	} );

	it( 'calls handleAutosavingToggle correctly when toggled off', () => {
		const mockHandleChange = jest.fn();
		const mockHandleToggle = jest.fn().mockImplementation( () => mockHandleChange );
		const { getByLabelText } = render(
			<NewsletterCategoriesToggle value={ true } handleAutosavingToggle={ mockHandleToggle } />
		);

		fireEvent.click( getByLabelText( 'Enable newsletter categories' ) );

		expect( mockHandleToggle ).toHaveBeenCalledWith( NEWSLETTER_CATEGORIES_ENABLED_OPTION );
		expect( mockHandleChange ).toHaveBeenCalledWith( false );
	} );

	it( 'calls handleAutosavingToggle correctly when toggled on', () => {
		const mockHandleChange = jest.fn();
		const mockHandleToggle = jest.fn().mockImplementation( () => mockHandleChange );
		const { getByLabelText } = render(
			<NewsletterCategoriesToggle value={ false } handleAutosavingToggle={ mockHandleToggle } />
		);

		fireEvent.click( getByLabelText( 'Enable newsletter categories' ) );

		expect( mockHandleToggle ).toHaveBeenCalledWith( NEWSLETTER_CATEGORIES_ENABLED_OPTION );
		expect( mockHandleChange ).toHaveBeenCalledWith( true );
	} );

	it( 'disables toggle control when disabled prop is true', () => {
		const mockHandleToggle = jest.fn().mockImplementation( () => () => undefined );
		const { getByLabelText } = render(
			<NewsletterCategoriesToggle
				value={ true }
				disabled={ true }
				handleAutosavingToggle={ mockHandleToggle }
			/>
		);

		const button = getByLabelText( 'Enable newsletter categories' );

		expect( button ).toBeDisabled();
	} );
} );
