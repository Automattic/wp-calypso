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
jest.mock( 'calypso/components/inline-support-link', () => () => 'MockInlineSupportLink' );

describe( 'NewsletterCategoriesSettings', () => {
	beforeEach( () => {
		( useTranslate as jest.Mock ).mockReturnValue( ( text: string ) => text );
	} );

	it( 'renders the toggle correctly', () => {
		render(
			<NewsletterCategoriesSection
				updateFields={ jest.fn() }
				newsletterCategoryIds={ [] }
				handleToggle={ jest.fn() }
				disabled={ false }
			/>
		);

		expect( screen.getByText( 'Enable newsletter categories' ) ).toBeInTheDocument();
	} );

	it( 'displays the term tree selector when toggleValue is true', () => {
		render(
			<NewsletterCategoriesSection
				newsletterCategoriesEnabled
				updateFields={ jest.fn() }
				newsletterCategoryIds={ [] }
				handleToggle={ jest.fn() }
				disabled={ false }
			/>
		);

		expect( screen.getByText( 'MockTermTreeSelector' ) ).toBeInTheDocument();
		expect( screen.getByText( 'MockTermTreeSelector' ) ).toHaveAttribute( 'aria-hidden', 'false' );
	} );

	it( 'hides the term tree selector when toggleValue is false', () => {
		render(
			<NewsletterCategoriesSection
				newsletterCategoriesEnabled={ false }
				handleToggle={ jest.fn() }
				updateFields={ jest.fn() }
				newsletterCategoryIds={ [] }
				disabled={ false }
			/>
		);

		expect( screen.queryByText( 'MockTermTreeSelector' ) ).toHaveAttribute( 'aria-hidden', 'true' );
	} );

	it( 'calls handleAutosavingToggle correctly when toggled off', () => {
		const mockHandleChange = jest.fn();
		const mockHandleToggle = jest.fn().mockImplementation( () => mockHandleChange );

		render(
			<NewsletterCategoriesSection
				newsletterCategoriesEnabled
				handleToggle={ mockHandleToggle }
				updateFields={ jest.fn() }
				newsletterCategoryIds={ [] }
				disabled={ false }
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
				newsletterCategoryIds={ [] }
				updateFields={ jest.fn() }
				disabled={ false }
			/>
		);

		fireEvent.click( screen.getByLabelText( 'Enable newsletter categories' ) );

		expect( mockHandleToggle ).toHaveBeenCalledWith( NEWSLETTER_CATEGORIES_ENABLED_OPTION );
		expect( mockHandleChange ).toHaveBeenCalledWith( true );
	} );
} );
