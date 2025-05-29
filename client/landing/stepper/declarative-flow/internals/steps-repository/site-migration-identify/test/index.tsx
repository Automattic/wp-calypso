/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import { useFlowState } from 'calypso/landing/stepper/declarative-flow/internals/state-manager/store';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import SiteMigrationIdentify from '..';
import { UrlData } from '../../../../../../../blocks/import/types';
import { StepProps } from '../../../types';
import { RenderStepOptions, mockStepProps, renderStep } from '../../test/helpers';

jest.mock( 'calypso/landing/stepper/declarative-flow/internals/state-manager/store', () => ( {
	useFlowState: jest.fn( () => ( {
		get: jest.fn().mockReturnValue( { entryPoint: 'goals' } ),
	} ) ),
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-site-slug' );
jest.mock(
	'../../site-migration-instructions/site-preview/hooks/use-site-preview-mshot-image-handler',
	() => ( {
		useSitePreviewMShotImageHandler: () => ( {
			createScreenshots: jest.fn(),
		} ),
	} )
);

const mockApi = () => nock( 'https://public-api.wordpress.com:443' );

const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
	const combinedProps = { ...mockStepProps( props ) };
	return renderStep( <SiteMigrationIdentify { ...combinedProps } />, renderOptions );
};

const API_RESPONSE_WORDPRESS_PLATFORM: UrlData = {
	url: 'https://example.com',
	platform: 'wordpress',
	meta: {
		title: 'Site Title',
		favicon: 'https://example.com/favicon.ico',
	},
};

const API_RESPONSE_WITH_OTHER_PLATFORM: UrlData = {
	url: 'https://example.com',
	platform: 'unknown',
	meta: {
		title: 'Site Title',
		favicon: 'https://example.com/favicon.ico',
	},
};

const MOCK_WORDPRESS_SITE_SLUG = 'test-example.wordpress.com';
const getInput = () => screen.getByLabelText( /Enter your site address/ );

describe( 'SiteMigrationIdentify', () => {
	beforeAll( () => nock.disableNetConnect() );
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'continues the flow when the platform is wordpress', async () => {
		jest.mocked( useSiteSlug ).mockReturnValue( MOCK_WORDPRESS_SITE_SLUG );

		const submit = jest.fn();
		render( { navigation: { submit } } );

		mockApi()
			.get( '/wpcom/v2/imports/analyze-url' )
			.query( { site_url: 'https://example.com' } )
			.reply( 200, API_RESPONSE_WORDPRESS_PLATFORM );

		await userEvent.type( getInput(), 'https://example.com' );

		await userEvent.click( screen.getByRole( 'button', { name: /Check my site/ } ) );

		await waitFor( () => {
			expect( submit ).toHaveBeenCalledWith(
				expect.objectContaining( {
					platform: 'wordpress',
					from: API_RESPONSE_WORDPRESS_PLATFORM.url,
				} )
			);
		} );
	} );

	it( 'continues the flow when the platform is unknown', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		mockApi()
			.get( '/wpcom/v2/imports/analyze-url' )
			.query( { site_url: 'https://example.com' } )
			.reply( 200, API_RESPONSE_WITH_OTHER_PLATFORM );

		await userEvent.type( getInput(), 'https://example.com' );

		await userEvent.click( screen.getByRole( 'button', { name: /Check my site/ } ) );

		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith( expect.objectContaining( { platform: 'unknown' } ) )
		);
	} );

	it( 'calls submit with the "skip" action when the user clicks on "choose a content platform"', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		await userEvent.click(
			screen.getByRole( 'button', { name: /pick your current platform from a list/ } )
		);

		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith(
				expect.objectContaining( { action: 'skip_platform_identification' } )
			)
		);
	} );

	it( 'shows an error when the api analyzer returns error', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		mockApi()
			.get( '/wpcom/v2/imports/analyze-url' )
			.query( { site_url: 'https://example.com' } )
			.reply( 500, new Error( 'Internal Server Error' ) );

		await userEvent.type( getInput(), 'https://example.com' );

		await userEvent.click( screen.getByRole( 'button', { name: /Check my site/ } ) );

		await waitFor( () =>
			expect( screen.getByText( /Please enter a valid website / ) ).toBeVisible()
		);
	} );

	it( 'sets the input value to the site url when the "from" param is set', () => {
		render( {}, { initialEntry: '/some-path?from=existent-site.com' } );

		expect( screen.getByRole( 'textbox' ) ).toHaveValue( 'existent-site.com' );
	} );

	it( 'sends again the same value set on the url', async () => {
		const submit = jest.fn();
		render(
			{ navigation: { submit } },
			{ initialEntry: '/some-path?from=https://existent-site.com' }
		);

		mockApi()
			.get( '/wpcom/v2/imports/analyze-url' )
			.query( { site_url: 'https://existent-site.com' } )
			.reply( 200, API_RESPONSE_WITH_OTHER_PLATFORM );

		await userEvent.click( screen.getByRole( 'button', { name: /Check my site/ } ) );
		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith( expect.objectContaining( { platform: 'unknown' } ) )
		);
	} );

	it( 'shows why host with us points', async () => {
		const submit = jest.fn();
		render( { navigation: { submit } } );

		expect( screen.getByText( /Why should you host with us/ ) ).toBeVisible();
		expect(
			screen.getByText(
				/Blazing fast speeds with lightning-fast load times for a seamless experience/
			)
		).toBeVisible();
		expect(
			screen.getByText( /Unmatched reliability with 99.999% uptime and unmetered traffic./ )
		).toBeVisible();
		expect(
			screen.getByText( /Round-the-clock security monitoring and DDoS protection./ )
		).toBeVisible();
	} );

	it( 'shows the back link when the entrypoint is "goals"', () => {
		jest.mocked( useFlowState ).mockReturnValue( {
			get: jest.fn().mockReturnValue( { entryPoint: 'goals' } ),
			set: jest.fn(),
			sessionId: null,
		} );
		render(
			{
				navigation: {
					goBack: jest.fn(),
					submit: jest.fn(),
				},
			},
			{ initialEntry: '/some-path?ref=goals' }
		);

		expect( screen.getByRole( 'button', { name: /Back/ } ) ).toBeVisible();
	} );

	it( 'shows the back button when the "back_to" param is defined', () => {
		render(
			{
				navigation: {
					goBack: jest.fn(),
					submit: jest.fn(),
				},
			},
			{ initialEntry: '/some-path?back_to=https://example.com' }
		);

		expect( screen.getByRole( 'link', { name: /Back/ } ) ).toBeVisible();
	} );

	it( 'shows the back button when the entrypoint is "wp-admin-importers-list"', () => {
		jest.mocked( useFlowState ).mockReturnValue( {
			get: jest.fn().mockReturnValue( { entryPoint: 'wp-admin-importers-list' } ),
			set: jest.fn(),
			sessionId: null,
		} );
		render(
			{
				navigation: {
					goBack: jest.fn(),
					submit: jest.fn(),
				},
			},
			{ initialEntry: '/some-path?ref=wp-admin-importers-list' }
		);

		expect( screen.getByRole( 'button', { name: /Back/ } ) ).toBeVisible();
	} );

	it( 'hides the back button and link by default', async () => {
		jest.mocked( useFlowState ).mockReturnValue( {
			get: jest.fn().mockReturnValue( {} ),
			set: jest.fn(),
			sessionId: null,
		} );
		render(
			{
				navigation: {
					goBack: jest.fn(),
					submit: jest.fn(),
				},
			},
			{ initialEntry: '/some-path' }
		);

		expect( screen.queryByRole( 'button', { name: /Back/ } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: /Back/ } ) ).not.toBeInTheDocument();
	} );
} );
