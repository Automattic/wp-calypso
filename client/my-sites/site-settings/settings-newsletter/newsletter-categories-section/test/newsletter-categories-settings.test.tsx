/**
 * @jest-environment jsdom
 */

import { render, fireEvent, screen } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { NewsletterCategoriesSection } from '..';
import { NEWSLETTER_CATEGORIES_ENABLED_OPTION } from '../newsletter-categories-toggle';

jest.mock( 'i18n-calypso' );
jest.mock( 'calypso/blocks/term-tree-selector', () => () => 'MockTermTreeSelector' );

describe( 'NewsletterCategoriesSettings', () => {
	beforeEach( () => {
		( useTranslate as jest.Mock ).mockReturnValue( ( text: string ) => text );
	} );

	it( 'renders the toggle correctly', () => {
		render(
			<NewsletterCategoriesSection
				handleSubmitForm={ jest.fn() }
				updateFields={ jest.fn() }
				newsletterCategoryIds={ [] }
				handleToggle={ jest.fn() }
				isSavingSettings={ false }
			/>
		);

		expect( screen.getByText( 'Enable newsletter categories' ) ).toBeInTheDocument();
	} );

	it( 'displays the term tree selector when toggleValue is true', () => {
		render(
			<NewsletterCategoriesSection
				newsletterCategoriesEnabled={ true }
				handleSubmitForm={ jest.fn() }
				updateFields={ jest.fn() }
				newsletterCategoryIds={ [] }
				handleToggle={ jest.fn() }
				isSavingSettings={ false }
			/>
		);

		expect( screen.getByText( 'MockTermTreeSelector' ) ).toBeInTheDocument();
		expect( screen.getByText( 'MockTermTreeSelector' ) ).toHaveAttribute( 'aria-hidden', 'false' );
		expect( screen.getByText( 'Save settings' ) ).toBeInTheDocument();
	} );

	it( 'hides the term tree selector when toggleValue is false', () => {
		render(
			<NewsletterCategoriesSection
				newsletterCategoriesEnabled={ false }
				handleToggle={ jest.fn() }
				updateFields={ jest.fn() }
				handleSubmitForm={ jest.fn() }
				newsletterCategoryIds={ [] }
				isSavingSettings={ false }
			/>
		);

		expect( screen.queryByText( 'MockTermTreeSelector' ) ).toHaveAttribute( 'aria-hidden', 'true' );
	} );

	it( 'calls handleAutosavingToggle correctly when toggled off', () => {
		const mockHandleChange = jest.fn();
		const mockHandleToggle = jest.fn().mockImplementation( () => mockHandleChange );

		render(
			<NewsletterCategoriesSection
				newsletterCategoriesEnabled={ true }
				handleToggle={ mockHandleToggle }
				updateFields={ jest.fn() }
				handleSubmitForm={ jest.fn() }
				newsletterCategoryIds={ [] }
				isSavingSettings={ false }
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
			<NewsletterCategoriesSection
				newsletterCategoriesEnabled={ false }
				handleToggle={ mockHandleToggle }
				handleSubmitForm={ jest.fn() }
				newsletterCategoryIds={ [] }
				updateFields={ jest.fn() }
				isSavingSettings={ false }
			/>
		);

		fireEvent.click( screen.getByLabelText( 'Enable newsletter categories' ) );

		expect( mockHandleToggle ).toHaveBeenCalledWith( NEWSLETTER_CATEGORIES_ENABLED_OPTION );
		expect( mockHandleChange ).toHaveBeenCalledWith( true );
	} );

	it( 'calls handleSubmitForm when the save button is clicked', () => {
		const handleSubmitForm = jest.fn();

		render(
			<NewsletterCategoriesSection
				newsletterCategoriesEnabled={ true }
				newsletterCategoryIds={ [] }
				handleSubmitForm={ handleSubmitForm }
				handleToggle={ jest.fn() }
				updateFields={ jest.fn() }
				isSavingSettings={ false }
			/>
		);

		fireEvent.click( screen.getByText( 'Save settings' ) );

		expect( handleSubmitForm ).toHaveBeenCalledTimes( 1 );
	} );
} );
