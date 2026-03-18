/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { logToLogstash } from 'calypso/lib/logstash';
import SiteMigrationAlreadyWPCOM from '../';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep, RenderStepOptions } from '../../test/helpers/index';

jest.mock( 'wpcom-proxy-request', () => jest.fn() );
jest.mock( 'calypso/landing/stepper/hooks/use-site-slug-param' );
jest.mock( 'calypso/lib/logstash' );

const continueButton = () => screen.getByRole( 'button', { name: 'Continue' } );
const intentByName = ( intent: string ) => screen.getByRole( 'checkbox', { name: intent } );
const otherDetails = () => screen.getByRole( 'textbox', { name: 'Other details' } );

describe( 'SiteMigrationAlreadyWPCOM', () => {
	const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
		const combinedProps = { ...mockStepProps( props ) };
		return renderStep( <SiteMigrationAlreadyWPCOM { ...combinedProps } />, renderOptions );
	};

	beforeEach( () => {
		jest.clearAllMocks();
		( wpcomRequest as jest.Mock ).mockResolvedValue( { success: true } );
		( useSiteSlugParam as jest.Mock ).mockReturnValue( 'site-url.wordpress.com' );
	} );

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

		await userEvent.click( intentByName( 'Other' ) );
		await userEvent.click( continueButton() );

		expect( await screen.findByText( /Please, provide more details/ ) ).toBeVisible();
	} );

	it( 'navigate to next step when the submits an intent', async () => {
		const navigation = { submit: jest.fn() };
		render( { navigation }, { initialEntry: '/some-path?from=https://example.com' } );

		await userEvent.click( intentByName( 'Transfer my domain to WordPress.com' ) );
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

	it( 'submits the request for the API properly', async () => {
		const navigation = { submit: jest.fn() };
		render( { navigation }, { initialEntry: '/some-path?from=https://example.com' } );

		await userEvent.click( intentByName( 'Transfer my domain to WordPress.com' ) );
		await userEvent.click( intentByName( 'Copy one of my existing sites on WordPress.com' ) );
		await userEvent.click( intentByName( 'Get access to my old site on WordPress.com' ) );
		await userEvent.click( intentByName( 'Other' ) );
		await userEvent.type( otherDetails(), 'Test Details' );
		await userEvent.click( continueButton() );

		expect( wpcomRequest ).toHaveBeenCalledWith( {
			path: '/sites/site-url.wordpress.com/automated-migration/wpcom-survey',
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			body: {
				intents: [
					'transfer-my-domain-to-wordpress-com',
					'copy-one-of-my-existing-sites-on-wordpress-com',
					'get-access-to-my-old-site-on-wordpress-com',
					'other',
				],
				other_details: 'Test Details',
			},
		} );

		expect( navigation.submit ).toHaveBeenCalled();
	} );

	it( 'shows error when something goes wrong in submission', async () => {
		const navigation = { submit: jest.fn() };
		render( { navigation }, { initialEntry: '/some-path?from=https://example.com' } );

		( wpcomRequest as jest.Mock ).mockRejectedValue( new Error( 'Some error message' ) );

		await userEvent.click( intentByName( 'Transfer my domain to WordPress.com' ) );
		await userEvent.click( intentByName( 'Other' ) );
		await userEvent.type( otherDetails(), 'Test Details' );
		await userEvent.click( continueButton() );

		expect( await screen.findByText( /Something went wrong. Please try again./ ) ).toBeVisible();
		expect( logToLogstash ).toHaveBeenCalledWith( {
			message: 'Error submitting migration ticket',
			feature: 'calypso_client',
			extra: {
				siteSlug: 'site-url.wordpress.com',
				step: 'site-migration-already-wpcom',
				from: 'https://example.com',
				error: 'Some error message',
			},
		} );

		expect( navigation.submit ).not.toHaveBeenCalled();
	} );
} );
