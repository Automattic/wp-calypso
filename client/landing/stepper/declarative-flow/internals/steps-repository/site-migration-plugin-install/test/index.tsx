/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import { select } from '@wordpress/data';
import nock from 'nock';
import React, { ComponentProps } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import SiteMigrationPluginInstall from '..';
import { ONBOARD_STORE } from '../../../../../stores';
import { RenderStepOptions, mockStepProps, renderStep } from '../../test/helpers';

type Props = ComponentProps< typeof SiteMigrationPluginInstall >;

const render = ( props?: Partial< Props >, renderOptions?: RenderStepOptions ) => {
	const combinedProps = { ...mockStepProps( props ) };
	return renderStep( <SiteMigrationPluginInstall { ...combinedProps } />, renderOptions );
};

jest.mock( 'calypso/landing/stepper/hooks/use-site' );

( useSite as jest.Mock ).mockReturnValue( {
	ID: 123,
} );

const originalSetTimeout = global.setTimeout;
const quickerSetTimeout = ( fn: NodeJS.TimerHandle, time: number ) =>
	originalSetTimeout( fn, time / 100 );

describe( 'SiteMigrationPluginInstall', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );
	afterEach( () => jest.clearAllMocks() );

	it( 'continues the flow when the plugin is installed', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await waitFor( () => expect( submit ).toHaveBeenCalledWith() );
	} );

	it( 'sets the proper pending action', async () => {
		jest.spyOn( global, 'setTimeout' ).mockImplementation( quickerSetTimeout );
		render();

		const { getProgress, getPendingAction } = select( ONBOARD_STORE );

		nock( 'https://public-api.wordpress.com:443' )
			.get( '/rest/v1.1/sites/123/plugins?http_envelope=1' )
			.once()
			.reply( 200, { plugins: [ { slug: 'migrate-guru' } ] } );

		nock( 'https://public-api.wordpress.com:443' )
			.post( '/rest/v1.2/sites/123/plugins/migrate-guru%2fmigrateguru', { active: true } )
			.reply( 200 );

		const result = await getPendingAction()();
		expect( result.pluginInstalled ).toBe( true );

		expect( nock.isDone() ).toBe( true );
		expect( getProgress() ).toBe( 100 );
	} );

	it( 'installs and activates the plugin when it is not installed', async () => {
		jest.spyOn( global, 'setTimeout' ).mockImplementation( quickerSetTimeout );
		render();

		const { getProgress, getPendingAction } = select( ONBOARD_STORE );

		nock( 'https://public-api.wordpress.com:443' )
			.get( '/rest/v1.1/sites/123/plugins?http_envelope=1' )
			.once()
			.reply( 200, { plugins: [] } );

		nock( 'https://public-api.wordpress.com:443' )
			.post( '/rest/v1.2/sites/123/plugins/migrate-guru/install' )
			.reply( 200 );

		nock( 'https://public-api.wordpress.com:443' )
			.post( '/rest/v1.2/sites/123/plugins/migrate-guru%2fmigrateguru', { active: true } )
			.reply( 200 );

		const result = await getPendingAction()();
		expect( result.pluginInstalled ).toBe( true );

		expect( nock.isDone() ).toBe( true );
		expect( getProgress() ).toBe( 100 );
	} );

	it( 'polls the plugin endpoint until we have information about the plugins', async () => {
		jest.spyOn( global, 'setTimeout' ).mockImplementation( quickerSetTimeout );
		render();

		const { getProgress, getPendingAction } = select( ONBOARD_STORE );

		nock( 'https://public-api.wordpress.com:443' )
			.get( '/rest/v1.1/sites/123/plugins?http_envelope=1' )
			.times( 2 ) // Returns error 2 times
			.reply( 500, 'Internal Server Error' )
			.get( '/rest/v1.1/sites/123/plugins?http_envelope=1' )
			.reply( 200, { plugins: [ { slug: 'migrate-guru' } ] } ); // Returns success

		nock( 'https://public-api.wordpress.com:443' )
			.post( '/rest/v1.2/sites/123/plugins/migrate-guru%2fmigrateguru', { active: true } )
			.reply( 200 );

		const result = await getPendingAction()();
		expect( result.pluginInstalled ).toBe( true );

		expect( nock.isDone() ).toBe( true );
		expect( getProgress() ).toBe( 100 );
	} );
} );
