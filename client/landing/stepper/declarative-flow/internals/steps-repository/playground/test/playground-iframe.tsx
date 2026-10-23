/**
 * @jest-environment jsdom
 */

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { speak } from '@wordpress/a11y';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { PlaygroundIframe } from '../components/playground-iframe';
import { BlueprintLoadError } from '../lib/blueprint-load-error';
import { initializeWordPressPlayground } from '../lib/initialize-playground';
import { PlaygroundNotFoundError } from '../lib/playground-not-found-error';

jest.mock( '../lib/initialize-playground' );
jest.mock( '@wordpress/a11y', () => ( { speak: jest.fn() } ) );
jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( 'calypso/data/php-versions', () => ( {
	getPHPVersions: () => ( { recommendedValue: '8.3' } ),
} ) );

let mockSearchParams: URLSearchParams;
const mockSetSearchParams = jest.fn();
jest.mock( 'react-router-dom', () => ( {
	useSearchParams: () => [ mockSearchParams, mockSetSearchParams ],
} ) );

describe( 'PlaygroundIframe acquisition retry', () => {
	const locationDescriptor = Object.getOwnPropertyDescriptor( window, 'location' )!;
	const reload = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
		Object.defineProperty( window, 'location', {
			configurable: true,
			value: { href: 'http://localhost/', reload },
		} );
		jest
			.mocked( initializeWordPressPlayground )
			.mockRejectedValue( new TypeError( 'Failed to fetch dynamically imported module' ) );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', locationDescriptor );
	} );

	it.each( [ null, 'saved-site-id' ] )(
		'reloads the current document without changing parameters for playground ID %s',
		async ( playgroundId ) => {
			mockSearchParams = new URLSearchParams( {
				blueprint: '123',
				'blueprint-url': 'https://example.com/synthetic-blueprint.json',
				intent: 'build',
			} );
			if ( playgroundId ) {
				mockSearchParams.set( 'playground', playgroundId );
			}
			const href = `http://localhost/setup/onboarding/playground?${ mockSearchParams }#preview`;
			window.location.href = href;
			const paramsBefore = mockSearchParams.toString();
			const setPlaygroundClient = jest.fn();

			render(
				<PlaygroundIframe
					hasPlaygroundClient={ false }
					setPlaygroundClient={ setPlaygroundClient }
				/>
			);

			const retry = await screen.findByRole( 'button', { name: 'Try again' } );
			expect( retry ).toBeVisible();
			expect( reload ).not.toHaveBeenCalled();
			await userEvent.click( retry );

			expect( reload ).toHaveBeenCalledTimes( 1 );
			expect( window.location.href ).toBe( href );
			expect( mockSearchParams.toString() ).toBe( paramsBefore );
			expect( mockSetSearchParams ).not.toHaveBeenCalled();
			expect( setPlaygroundClient ).not.toHaveBeenCalled();
			expect( initializeWordPressPlayground ).toHaveBeenCalledTimes( 1 );
		}
	);
} );

describe( 'PlaygroundIframe intro', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockSearchParams = new URLSearchParams( { intent: 'woocommerce', blueprint: 'woocommerce' } );
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	const renderIframe = ( withIntro: boolean ) =>
		render(
			<PlaygroundIframe
				hasPlaygroundClient={ false }
				setPlaygroundClient={ jest.fn() }
				withIntro={ withIntro }
			/>
		);

	const getIntroHeading = () =>
		screen.queryByRole( 'heading', { name: 'Build first, choose hosting later' } );

	it( 'follows the boot progress and is removed once the Playground is ready', async () => {
		let resolveBoot: ( value: unknown ) => void = () => {};
		jest.mocked( initializeWordPressPlayground ).mockReturnValue(
			new Promise( ( resolve ) => {
				resolveBoot = resolve as ( value: unknown ) => void;
			} ) as ReturnType< typeof initializeWordPressPlayground >
		);

		const { container } = renderIframe( true );

		expect( getIntroHeading() ).toBeVisible();
		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Downloading WordPress' );
		expect( container.querySelector( 'iframe' ) ).toHaveAttribute( 'inert' );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_playground_woo_intro_show', {
			blueprint: expect.any( String ),
		} );

		const onBootProgress = jest.mocked( initializeWordPressPlayground ).mock.calls[ 0 ][ 4 ]!;
		act( () => onBootProgress( { stage: 'woocommerce' } ) );
		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Downloading WooCommerce' );

		await act( async () => resolveBoot( { blueprint: null, client: {} } ) );
		expect( getIntroHeading() ).not.toBeInTheDocument();
		expect( container.querySelector( 'iframe' ) ).not.toHaveAttribute( 'inert' );
		expect( speak ).toHaveBeenCalledWith( 'Your store is ready.' );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_playground_woo_intro_ready', {
			blueprint: expect.any( String ),
			duration_seconds: expect.any( Number ),
		} );
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_playground_woo_intro_failed',
			expect.anything()
		);
	} );

	it( 'gives way to the error screen when the boot fails', async () => {
		jest.mocked( initializeWordPressPlayground ).mockRejectedValue( new Error( 'boot failed' ) );

		renderIframe( true );

		expect( await screen.findByRole( 'button', { name: 'Try again' } ) ).toBeVisible();
		expect( getIntroHeading() ).not.toBeInTheDocument();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_playground_woo_intro_failed', {
			blueprint: expect.any( String ),
			reason: 'boot',
			duration_seconds: expect.any( Number ),
		} );
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_playground_woo_intro_ready',
			expect.anything()
		);
	} );

	it( 'shows when the not-found countdown starts a new playground', async () => {
		jest.useFakeTimers();
		mockSearchParams.set( 'playground', 'missing-id' );
		jest
			.mocked( initializeWordPressPlayground )
			.mockRejectedValueOnce( new PlaygroundNotFoundError( 'missing-id', new Error() ) )
			.mockReturnValue( new Promise( () => {} ) );

		renderIframe( true );
		expect( getIntroHeading() ).not.toBeInTheDocument();

		await act( async () => {} );
		// Each countdown second schedules the next one after it renders.
		for ( let second = 0; second < 5; second++ ) {
			await act( async () => jest.advanceTimersByTime( 1000 ) );
		}

		expect( initializeWordPressPlayground ).toHaveBeenCalledTimes( 2 );
		expect( getIntroHeading() ).toBeVisible();
	} );

	it( 'does not show when the default blueprint replaces one that failed to load', async () => {
		jest
			.mocked( initializeWordPressPlayground )
			.mockRejectedValueOnce( new BlueprintLoadError( 'https://example.com', new Error() ) )
			.mockReturnValue( new Promise( () => {} ) );

		renderIframe( true );
		await userEvent.click(
			await screen.findByRole( 'button', { name: 'Start a new playground' } )
		);

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_playground_woo_intro_failed', {
			blueprint: expect.any( String ),
			reason: 'blueprint_load',
			duration_seconds: expect.any( Number ),
		} );
		expect( initializeWordPressPlayground ).toHaveBeenCalledTimes( 2 );
		expect( getIntroHeading() ).not.toBeInTheDocument();
	} );

	it( 'is not shown or fed progress without withIntro', () => {
		jest.mocked( initializeWordPressPlayground ).mockReturnValue( new Promise( () => {} ) );

		renderIframe( false );

		expect( getIntroHeading() ).not.toBeInTheDocument();
		expect( jest.mocked( initializeWordPressPlayground ).mock.calls[ 0 ][ 4 ] ).toBeUndefined();
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );
} );
