/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import SiteMigrationAlreadyWordPress from '../';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep, RenderStepOptions } from '../../test/helpers/index';

const continueButton = () => screen.getByRole( 'button', { name: 'Continue' } );
const intentByName = ( intent: string ) => screen.getByRole( 'checkbox', { name: intent } );
const otherDetails = () => screen.getByRole( 'textbox', { name: 'Other details' } );

describe( 'SiteMigrationAlreadyWordPress', () => {
	const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
		const combinedProps = { ...mockStepProps( props ) };
		return renderStep( <SiteMigrationAlreadyWordPress { ...combinedProps } />, renderOptions );
	};

	it( 'renders the site domain from the query params', () => {
		render( {}, { initialEntry: '/some-path?from=https://example.com' } );
		expect( screen.getByText( 'example.com' ) ).toBeVisible();
	} );

	it( 'shows an error when the user does not select an option', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } }, { initialEntry: '/some-path?from=https://example.com' } );

		await userEvent.click( continueButton() );
		expect( await screen.findByText( /Please select an option/ ) ).toBeVisible();
	} );

	it( 'shows an error when the user selects other but does not provide details', async () => {
		render( {}, { initialEntry: '/some-path?from=https://example.com' } );
		userEvent.click( intentByName( 'Other' ) );
		await userEvent.click( continueButton() );

		expect( await screen.findByText( /Please, provide more details/ ) ).toBeVisible();
	} );

	it( 'navigate to next step when the submits an intent', async () => {
		const navigation = { submit: jest.fn() };
		render( { navigation }, { initialEntry: '/some-path?from=https://example.com' } );

		userEvent.click( intentByName( 'Transfer my domain to WordPress.com' ) );
		await userEvent.click( continueButton() );

		expect( navigation.submit ).toHaveBeenCalled();
	} );

	it( 'navigate to next step when the user describes their needs manually', async () => {
		const navigation = { submit: jest.fn() };
		render( { navigation }, { initialEntry: '/some-path?from=https://example.com' } );

		await userEvent.click( intentByName( 'Other' ) );
		await userEvent.type(
			otherDetails(),
			'I need to migrate my site to WordPress.com but I already have a WordPress.com account'
		);
		await userEvent.click( continueButton() );

		expect( navigation.submit ).toHaveBeenCalled();
	} );
} );
