/**
 * @jest-environment jsdom
 */

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaygroundIframe } from '../components/playground-iframe';
import { initializeWordPressPlayground } from '../lib/initialize-playground';

jest.mock( '../lib/initialize-playground' );
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
		mockSearchParams = new URLSearchParams( { intent: 'woocommerce' } );
	} );

	const renderIframe = ( showIntro: boolean ) =>
		render(
			<PlaygroundIframe
				hasPlaygroundClient={ false }
				setPlaygroundClient={ jest.fn() }
				showIntro={ showIntro }
			/>
		);

	const getIntroHeading = () =>
		screen.queryByRole( 'heading', { name: 'Build first, choose hosting later' } );

	it( 'follows the boot progress and is removed once the Playground is ready', async () => {
		let resolveBoot: ( value: unknown ) => void = () => {};
		jest.mocked( initializeWordPressPlayground ).mockReturnValue(
			new Promise( ( resolve ) => {
				resolveBoot = resolve;
			} ) as ReturnType< typeof initializeWordPressPlayground >
		);

		renderIframe( true );

		expect( getIntroHeading() ).toBeVisible();
		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Downloading WordPress' );

		const onBootProgress = jest.mocked( initializeWordPressPlayground ).mock.calls[ 0 ][ 4 ]!;
		act( () => onBootProgress( { stage: 'woocommerce', value: 60 } ) );
		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Downloading WooCommerce' );

		await act( async () => resolveBoot( { blueprint: null, client: {} } ) );
		expect( getIntroHeading() ).not.toBeInTheDocument();
	} );

	it( 'gives way to the error screen when the boot fails', async () => {
		jest.mocked( initializeWordPressPlayground ).mockRejectedValue( new Error( 'boot failed' ) );

		renderIframe( true );

		expect( await screen.findByRole( 'button', { name: 'Try again' } ) ).toBeVisible();
		expect( getIntroHeading() ).not.toBeInTheDocument();
	} );

	it( 'is not shown or fed progress without showIntro', () => {
		jest.mocked( initializeWordPressPlayground ).mockReturnValue( new Promise( () => {} ) );

		renderIframe( false );

		expect( getIntroHeading() ).not.toBeInTheDocument();
		expect( jest.mocked( initializeWordPressPlayground ).mock.calls[ 0 ][ 4 ] ).toBeUndefined();
	} );
} );
