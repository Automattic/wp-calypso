/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

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

	it( 'submits with importer destination', async () => {
		const submit = jest.fn();

		render( { navigation: { submit } } );

		await userEvent.click( await importYourContentButton() );

		expect( submit ).toHaveBeenCalledWith( {
			action: 'import',
			platform: 'squarespace',
		} );
	} );

	it( 'shows the platform name using friendly names', () => {
		render( {}, { initialEntry: '/step?platform=movabletype&from=https://example.com' } );

		expect( screen.getByText( /Movable Type & TypePad/ ) ).toBeVisible();
	} );

	it( 'hides the import button when the platform is not supported', async () => {
		render( {}, { initialEntry: '/step?platform=nonsupportedplatform&from=https://example.com' } );

		expect(
			screen.queryByRole( 'button', { name: 'Import Your Content' } )
		).not.toBeInTheDocument();
	} );
} );
