/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import SiteMigrationPluginInstall from '../';
import { StepProps } from '../../../types';
import { renderStep, mockStepProps, RenderStepOptions } from '../../test/helpers';

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
	const combinedProps = { ...mockStepProps( props ) };
	return renderStep( <SiteMigrationPluginInstall { ...combinedProps } />, renderOptions );
};

describe( 'Site Migration Plugin Step Install', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	it( 'shows the loading state', async () => {
		render();

		expect( screen.getByText( 'Installing plugins' ) ).toBeVisible();
	} );

	it( 'triggers the next step when the plugin is installed', async () => {
		const submit = jest.fn();

		mockApi().post( '/rest/v1.2/sites/123/plugins/install', { slug: 'migrate-guru' } ).reply( 200 );

		mockApi()
			.post( '/rest/v1.2/sites/123/plugins/migrate-guru%2fmigrateguru', { active: true } )
			.reply( 200 );

		render( { navigation: { submit } } );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith() );
	} );

	it( 'redirects to the error page when there is any error', async () => {
		const submit = jest.fn();

		mockApi()
			.post( '/rest/v1.2/sites/123/plugins/install' )
			.reply( 500, new Error( 'Internal Server Error' ) );

		render( { navigation: { submit } } );

		//TODO: Update it when we add error handling with message.
		await waitFor( () => expect( submit ).toHaveBeenCalledWith( { error: expect.any( Error ) } ) );
	} );
} );
