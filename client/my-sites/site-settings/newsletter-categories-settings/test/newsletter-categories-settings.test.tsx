/**
 * @jest-environment jsdom
 */

import { render, fireEvent } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'calypso/state';
import { NewsletterCategoriesSettings } from '..';
import { NEWSLETTER_CATEGORIES_ENABLED_OPTION } from '../newsletter-categories-toggle';
import useNewsletterCategoriesSettings from '../use-newsletter-categories-settings';

jest.mock( 'i18n-calypso' );
jest.mock( 'calypso/state' );
jest.mock( '../use-newsletter-categories-settings' );
jest.mock( 'calypso/blocks/term-tree-selector', () => () => 'MockTermTreeSelector' );

const mockSiteId = 123;

describe( 'NewsletterCategoriesSettings', () => {
	beforeEach( () => {
		( useTranslate as jest.Mock ).mockReturnValue( ( text: string ) => text );
		( useSelector as jest.Mock ).mockReturnValue( mockSiteId );
		( useNewsletterCategoriesSettings as jest.Mock ).mockReturnValue( {
			isSaving: false,
			newsletterCategoryIds: [ 1, 2, 3 ],
			handleCategoryToggle: jest.fn(),
			handleSave: jest.fn(),
		} );
	} );

	it( 'renders the toggle correctly', () => {
		const { getByText } = render(
			<NewsletterCategoriesSettings handleAutosavingToggle={ jest.fn() } />
		);

		expect( getByText( 'Enable newsletter categories' ) ).toBeInTheDocument();
	} );

	it( 'displays the term tree selector when toggleValue is true', () => {
		const { getByText } = render(
			<NewsletterCategoriesSettings toggleValue={ true } handleAutosavingToggle={ jest.fn() } />
		);

		expect( getByText( 'MockTermTreeSelector' ) ).toBeInTheDocument();
		expect( getByText( 'MockTermTreeSelector' ) ).toHaveAttribute( 'aria-hidden', 'false' );
		expect( getByText( 'Save settings' ) ).toBeInTheDocument();
	} );

	it( 'hides the term tree selector when toggleValue is false', () => {
		const { queryByText } = render(
			<NewsletterCategoriesSettings toggleValue={ false } handleAutosavingToggle={ jest.fn() } />
		);

		expect( queryByText( 'MockTermTreeSelector' ) ).toHaveAttribute( 'aria-hidden', 'true' );
	} );

	it( 'calls handleAutosavingToggle correctly when toggled off', () => {
		const mockHandleChange = jest.fn();
		const mockHandleToggle = jest.fn().mockImplementation( () => mockHandleChange );
		const { getByLabelText } = render(
			<NewsletterCategoriesSettings
				toggleValue={ true }
				handleAutosavingToggle={ mockHandleToggle }
			/>
		);

		fireEvent.click( getByLabelText( 'Enable newsletter categories' ) );

		expect( mockHandleToggle ).toHaveBeenCalledWith( NEWSLETTER_CATEGORIES_ENABLED_OPTION );
		expect( mockHandleChange ).toHaveBeenCalledWith( false );
	} );

	it( 'calls handleAutosavingToggle correctly when toggled on', () => {
		const mockHandleChange = jest.fn();
		const mockHandleToggle = jest.fn().mockImplementation( () => mockHandleChange );
		const { getByLabelText } = render(
			<NewsletterCategoriesSettings
				toggleValue={ false }
				handleAutosavingToggle={ mockHandleToggle }
			/>
		);

		fireEvent.click( getByLabelText( 'Enable newsletter categories' ) );

		expect( mockHandleToggle ).toHaveBeenCalledWith( NEWSLETTER_CATEGORIES_ENABLED_OPTION );
		expect( mockHandleChange ).toHaveBeenCalledWith( true );
	} );

	it( 'calls handleSave when the save button is clicked', () => {
		const handleNewsletterCategoriesSettings = useNewsletterCategoriesSettings( mockSiteId );

		const { getByText } = render(
			<NewsletterCategoriesSettings handleAutosavingToggle={ jest.fn() } />
		);

		fireEvent.click( getByText( 'Save settings' ) );

		expect( handleNewsletterCategoriesSettings.handleSave ).toHaveBeenCalled();
	} );
} );
