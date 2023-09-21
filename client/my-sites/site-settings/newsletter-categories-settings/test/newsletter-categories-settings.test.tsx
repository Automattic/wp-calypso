/**
 * @jest-environment jsdom
 */

import { render, fireEvent, screen } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { NewsletterCategoriesSettings } from '..';
import { NEWSLETTER_CATEGORIES_ENABLED_OPTION } from '../newsletter-categories-toggle';

jest.mock( 'i18n-calypso' );
jest.mock( 'calypso/blocks/term-tree-selector', () => () => 'MockTermTreeSelector' );

describe( 'NewsletterCategoriesSettings', () => {
	beforeEach( () => {
		( useTranslate as jest.Mock ).mockReturnValue( ( text: string ) => text );
	} );

	it( 'renders the toggle correctly', () => {
		render(
			<NewsletterCategoriesSettings
				handleSubmitForm={ jest.fn() }
				updateFields={ jest.fn() }
				newsletterCategoryIds={ [] }
				handleAutosavingToggle={ jest.fn() }
			/>
		);

		expect( screen.getByText( 'Enable newsletter categories' ) ).toBeInTheDocument();
	} );

	it( 'displays the term tree selector when toggleValue is true', () => {
		render(
			<NewsletterCategoriesSettings
				toggleValue={ true }
				handleSubmitForm={ jest.fn() }
				updateFields={ jest.fn() }
				newsletterCategoryIds={ [] }
				handleAutosavingToggle={ jest.fn() }
			/>
		);

		expect( screen.getByText( 'MockTermTreeSelector' ) ).toBeInTheDocument();
		expect( screen.getByText( 'MockTermTreeSelector' ) ).toHaveAttribute( 'aria-hidden', 'false' );
		expect( screen.getByText( 'Save settings' ) ).toBeInTheDocument();
	} );

	it( 'hides the term tree selector when toggleValue is false', () => {
		render(
			<NewsletterCategoriesSettings
				toggleValue={ false }
				handleAutosavingToggle={ jest.fn() }
				updateFields={ jest.fn() }
				handleSubmitForm={ jest.fn() }
				newsletterCategoryIds={ [] }
			/>
		);

		expect( screen.queryByText( 'MockTermTreeSelector' ) ).toHaveAttribute( 'aria-hidden', 'true' );
	} );

	it( 'calls handleAutosavingToggle correctly when toggled off', () => {
		const mockHandleChange = jest.fn();
		const mockHandleToggle = jest.fn().mockImplementation( () => mockHandleChange );

		render(
			<NewsletterCategoriesSettings
				toggleValue={ true }
				handleAutosavingToggle={ mockHandleToggle }
				updateFields={ jest.fn() }
				handleSubmitForm={ jest.fn() }
				newsletterCategoryIds={ [] }
			/>
		);

		fireEvent.click( screen.getByLabelText( 'Enable newsletter categories' ) );

		expect( mockHandleToggle ).toHaveBeenCalledWith( NEWSLETTER_CATEGORIES_ENABLED_OPTION );
		expect( mockHandleChange ).toHaveBeenCalledWith( false );
	} );

	it( 'calls handleAutosavingToggle correctly when toggled on', () => {
		const mockHandleChange = jest.fn();
		const mockHandleToggle = jest.fn().mockImplementation( () => mockHandleChange );

		render(
			<NewsletterCategoriesSettings
				toggleValue={ false }
				handleAutosavingToggle={ mockHandleToggle }
			/>
		);

		fireEvent.click( screen.getByLabelText( 'Enable newsletter categories' ) );

		expect( mockHandleToggle ).toHaveBeenCalledWith( NEWSLETTER_CATEGORIES_ENABLED_OPTION );
		expect( mockHandleChange ).toHaveBeenCalledWith( true );
	} );

	it( 'calls handleSubmitForm when the save button is clicked', () => {
		const handleSubmitForm = jest.fn();

		render(
			<NewsletterCategoriesSettings
				toggleValue={ true }
				newsletterCategoryIds={ [] }
				handleSubmitForm={ handleSubmitForm }
				handleAutosavingToggle={ jest.fn() }
				updateFields={ jest.fn() }
			/>
		);

		fireEvent.click( screen.getByText( 'Save settings' ) );

		expect( handleSubmitForm ).toHaveBeenCalledTimes( 1 );
	} );
} );
