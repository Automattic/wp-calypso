/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { defaultSiteDetails } from '../../../launchpad/test/lib/fixtures';
import SetupForm from '../index';

jest.mock( 'calypso/landing/stepper/hooks/use-site-slug-param', () => ( {
	useSiteSlugParam: () => 'wordpresstestsite.wordpress.com',
} ) );

const newSiteProps = {
	site: null,
	siteTitle: '',
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	setComponentSiteTitle: () => {},
	invalidSiteTitle: false,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	setInvalidSiteTitle: () => {},
	tagline: '',
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	setTagline: () => {},
	selectedFile: undefined,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	setSelectedFile: () => {},
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	setBase64Image: () => {},
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	handleSubmit: () => {},
};

const existingSiteProps = {
	...newSiteProps,
	site: defaultSiteDetails,
	siteTitle: defaultSiteDetails.name || '',
	tagline: defaultSiteDetails.description || '',
};

describe( 'SetupForm', () => {
	describe( 'when form is rendered with null site, title, and tagline', () => {
		it( 'displays expected default fields', () => {
			render( <SetupForm { ...newSiteProps } /> );
			const iconField = screen.getByText( 'Upload a profile image' );
			const siteTitleField = screen.getByPlaceholderText( 'My Site Name' );
			const siteTaglineField = screen.getByPlaceholderText( 'Add a short description here' );
			const continueButton = screen.getByRole( 'button', { name: /Continue/i } );
			expect( iconField ).toBeInTheDocument();
			expect( siteTitleField ).toBeInTheDocument();
			expect( siteTaglineField ).toBeInTheDocument();
			expect( continueButton ).toBeInTheDocument();
		} );
	} );
	describe( 'when form is rendered with existing site, prefills settings correctly', () => {
		it( 'displays fields prefilled with site details', () => {
			render( <SetupForm { ...existingSiteProps } /> );
			const icon = screen.getByRole( 'img' );
			const iconUpdateButton = screen.getByText( 'Replace' );
			const siteTitleField = screen.getByDisplayValue( existingSiteProps.siteTitle );
			const siteTaglineField = screen.getByDisplayValue( existingSiteProps.tagline );
			expect( iconUpdateButton ).toBeInTheDocument();
			expect( icon ).toBeInTheDocument();
			expect( icon ).toHaveAttribute( 'src', existingSiteProps.site.icon.img );
			expect( siteTitleField ).toBeInTheDocument();
			expect( siteTaglineField ).toBeInTheDocument();
		} );
	} );
	describe( 'when title field is invalid', () => {
		it( 'shows validation error', async () => {
			const props = { ...newSiteProps, invalidSiteTitle: true };
			render( <SetupForm { ...props } /> );
			const validationError = screen.getByText( /Oops/i );
			expect( validationError ).toBeInTheDocument();
		} );
	} );
	describe( 'when title field is valid', () => {
		it( 'does not show validation error', async () => {
			render( <SetupForm { ...newSiteProps } /> );
			const validationError = screen.queryByText( /Oops/i );
			expect( validationError ).not.toBeInTheDocument();
		} );
	} );
} );
