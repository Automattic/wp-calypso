/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import SiteMigrationIdentify from '..';
import { UrlData } from '../../../../../../../blocks/import/types';
import { StepProps } from '../../../types';
import { RenderStepOptions, mockStepProps, renderStep } from '../../test/helpers';

const mockFlowState = new Map< string, unknown >();

jest.mock( 'calypso/landing/stepper/declarative-flow/internals/state-manager/store', () => ( {
	useFlowState: jest.fn( () => ( {
		get: jest.fn( ( key: string ) => mockFlowState.get( key ) ),
		set: jest.fn( ( key: string, value: unknown ) => mockFlowState.set( key, value ) ),
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
const getInput = () => screen.getByLabelText( /Site address/ );

describe( 'SiteMigrationIdentify', () => {
	beforeAll( () => nock.disableNetConnect() );
	beforeEach( () => {
		jest.clearAllMocks();
		mockFlowState.clear();
		mockFlowState.set( 'flow', { entryPoint: 'goals' } );
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

	it.each( [ 'example.com', 'https://example.com/blog/?tag=test#section' ] )(
		'restores the entered address %s after the analyzer follows a redirect',
		async ( enteredUrl ) => {
			const user = userEvent.setup();
			const submit = jest.fn();
			const resolvedUrl = 'https://redirected.example.com';
			const { unmount } = render( { navigation: { submit } } );

			mockApi()
				.get( '/wpcom/v2/imports/analyze-url' )
				.query( { site_url: enteredUrl } )
				.reply( 200, { ...API_RESPONSE_WORDPRESS_PLATFORM, url: resolvedUrl } );
			mockApi()
				.get( '/wpcom/v2/site-profiler/hosting-provider/redirected.example.com' )
				.reply( 200, { hosting_provider: { slug: 'unknown' } } );

			await user.type( getInput(), enteredUrl );
			await user.click( screen.getByRole( 'button', { name: /Check my site/ } ) );
			await waitFor( () =>
				expect( submit ).toHaveBeenCalledWith(
					expect.objectContaining( { from: resolvedUrl, platform: 'wordpress', host: 'unknown' } )
				)
			);

			unmount();
			render( {}, { initialEntry: `/some-path?from=${ encodeURIComponent( resolvedUrl ) }` } );

			expect( getInput() ).toHaveValue( enteredUrl );
		}
	);

	it( 'remembers an edited address when returning to the identification step', async () => {
		const user = userEvent.setup();
		const submit = jest.fn();
		mockFlowState.set( 'migrationSourceUrl', 'https://previous.example.com' );
		const { unmount } = render(
			{ navigation: { submit } },
			{ initialEntry: '/some-path?from=https://previous-target.example.com' }
		);

		mockApi()
			.get( '/wpcom/v2/imports/analyze-url' )
			.query( { site_url: 'https://example.com' } )
			.reply( 200, API_RESPONSE_WORDPRESS_PLATFORM );
		mockApi()
			.get( '/wpcom/v2/site-profiler/hosting-provider/example.com' )
			.reply( 200, { hosting_provider: { slug: 'unknown' } } );

		await user.clear( getInput() );
		await user.type( getInput(), 'https://example.com' );
		await user.click( screen.getByRole( 'button', { name: /Check my site/ } ) );
		await waitFor( () => expect( submit ).toHaveBeenCalled() );

		unmount();
		render( {}, { initialEntry: '/some-path?from=https://previous-target.example.com' } );

		expect( getInput() ).toHaveValue( 'https://example.com' );
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

	it( 'shows the back link when the "ref" param is set', () => {
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

	it( 'hides the back button and link by default', async () => {
		render(
			{
				navigation: {
					goBack: undefined,
					submit: jest.fn(),
				},
			},
			{ initialEntry: '/some-path' }
		);

		expect( screen.queryByRole( 'button', { name: /Back/ } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: /Back/ } ) ).not.toBeInTheDocument();
	} );
} );
