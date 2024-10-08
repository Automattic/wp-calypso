/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import SiteMigrationOtherPlatform from '..';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep, RenderStepOptions } from '../../test/helpers';

const skipButton = () => screen.findByRole( 'button', { name: 'I need help, please guide me' } );
const importYourContentButton = () =>
	screen.findByRole( 'button', { name: 'Import Your Content' } );

describe( 'Site Migration Other Platform Detected Import', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	const render = ( props?: Partial< StepProps >, options?: RenderStepOptions ) => {
		const combinedProps = { ...mockStepProps( props ) };
		const defaultOptions = {
			initialEntry: '/step?from=https://example.com&platform=squarespace',
		};

		return renderStep( <SiteMigrationOtherPlatform { ...combinedProps } />, {
			...defaultOptions,
			...options,
		} );
	};

	it( 'submits with skip action', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click( await skipButton() );

		expect( submit ).toHaveBeenCalledWith( {
			action: 'skip',
		} );
	} );

	it( 'scans the user site when the platform is not available', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/imports/analyze-url' )
			.query( { site_url: 'https://example.com' } )
			.once()
			.reply( 200, {
				platform: 'squarespace',
			} );

		render( {}, { initialEntry: '/step?from=https://example.com' } );

		expect( await screen.findByText( /Scanning your site/ ) ).toBeVisible();
	} );

	it( 'submits with importer destination', async () => {
		const submit = jest.fn();

		render( { navigation: { submit } } );

		await userEvent.click( await importYourContentButton() );

		expect( submit ).toHaveBeenCalledWith( {
			action: 'import',
			platform: 'squarespace',
		} );
	} );
} );
