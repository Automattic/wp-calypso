/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PlaygroundStep from '..';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep, RenderStepOptions } from '../../test/helpers';
import { BlueprintLoadError } from '../lib/blueprint-load-error';
import { initializeWordPressPlayground } from '../lib/initialize-playground';
import { PlaygroundNotFoundError } from '../lib/playground-not-found-error';

// Mock the initializeWordPressPlayground function
jest.mock( '../lib/initialize-playground' );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

// Mock the PlaygroundError component to simplify testing
jest.mock( '../components/playground-error', () => ( {
	PlaygroundError: ( { error, createNewPlayground } ) => (
		<div data-testid="playground-error">
			{ error.name }
			<button onClick={ createNewPlayground }>Create new playground</button>
		</div>
	),
} ) );

let mockPlaygroundClientInstance;

const renderPlaygroundStep = (
	props?: Partial< StepProps >,
	renderOptions?: RenderStepOptions
) => {
	const combinedProps = {
		...mockStepProps( { flow: 'onboarding', stepName: 'playground', ...props } ),
	};

	return renderStep( <PlaygroundStep { ...combinedProps } />, renderOptions );
};

const getLaunchButton = () => screen.getByRole( 'button', { name: 'Launch on WordPress.com' } );
const getSaveStoreButton = () => screen.getByRole( 'button', { name: 'Save my store' } );

describe( 'Playground', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockPlaygroundClientInstance = {
			run: jest.fn().mockImplementation( () => Promise.resolve( { text: 'plans-playground' } ) ),
		};
		initializeWordPressPlayground.mockResolvedValue( {
			blueprint: null,
			client: mockPlaygroundClientInstance,
		} );
	} );

	describe( 'step', () => {
		it( 'should render the iframe and the launch button', async () => {
			let container;

			await act( async () => {
				const result = renderPlaygroundStep();
				container = result.container;
			} );

			expect( getLaunchButton() ).toBeVisible();
			expect( container.querySelector( 'iframe' ) ).toBeVisible();
		} );

		it( 'should change page when the user clicks the launch button', async () => {
			const submit = jest.fn();

			await act( async () => {
				renderPlaygroundStep(
					{ navigation: { submit } },
					{ initialEntry: '/setup/onboarding/playground?blueprint=123&playground=1' }
				);
			} );

			await userEvent.click( getLaunchButton() );
			expect( submit ).toHaveBeenCalled();
		} );

		it( 'should keep launch button disabled when playground query parameter is missing', async () => {
			await act( async () => {
				renderPlaygroundStep();
			} );

			expect( getLaunchButton() ).toBeDisabled();
		} );

		it( 'should show the save store button when intent is woocommerce', async () => {
			await act( async () => {
				renderPlaygroundStep(
					{},
					{
						initialEntry:
							'/setup/onboarding/playground?blueprint=woocommerce&playground=1&intent=woocommerce',
					}
				);
			} );

			expect( getSaveStoreButton() ).toBeVisible();
		} );

		it.each( [
			[ 'a new Woo Playground', '?intent=woocommerce&blueprint=woocommerce', true ],
			[
				'a restored Woo Playground',
				'?intent=woocommerce&blueprint=woocommerce&playground=1',
				false,
			],
			[ 'the default blueprint under the Woo intent', '?intent=woocommerce', false ],
			[ 'a new Playground without the Woo intent', '?blueprint=woocommerce', false ],
		] )( 'intro visibility for %s', async ( _label, search, shown ) => {
			initializeWordPressPlayground.mockReturnValue( new Promise( () => {} ) );

			await act( async () => {
				renderPlaygroundStep( {}, { initialEntry: `/setup/onboarding/playground${ search }` } );
			} );

			const heading = screen.queryByRole( 'heading', {
				name: 'Build first, choose hosting later',
			} );
			expect( Boolean( heading ) ).toBe( shown );
			const topBarButton = screen.getByRole( 'button', {
				name: /Save my store|Launch on WordPress.com/,
			} );
			expect( Boolean( topBarButton.closest( '[inert]' ) ) ).toBe( shown );
		} );
	} );

	describe( 'launch tracking', () => {
		const getLaunchEventProps = () =>
			recordTracksEvent.mock.calls.find(
				( [ eventName ] ) => eventName === 'calypso_playground_launch_site'
			)?.[ 1 ];

		it( 'should flag WooCommerce launches', async () => {
			await act( async () => {
				renderPlaygroundStep(
					{},
					{
						initialEntry:
							'/setup/onboarding/playground?blueprint=woocommerce&playground=1&intent=woocommerce',
					}
				);
			} );

			await userEvent.click( getSaveStoreButton() );

			expect( getLaunchEventProps() ).toEqual(
				expect.objectContaining( { is_woocommerce_intent: true } )
			);
		} );

		it( 'should not flag other launches and keep the existing properties', async () => {
			await act( async () => {
				renderPlaygroundStep(
					{ flow: 'onboarding' },
					{ initialEntry: '/setup/onboarding/playground?blueprint=123&playground=1' }
				);
			} );

			await userEvent.click( getLaunchButton() );

			expect( getLaunchEventProps() ).toEqual( {
				flow: 'onboarding',
				step: 'playground',
				blueprint: 'bpl-123',
				intent: 'plans-playground',
				is_woocommerce_intent: false,
			} );
		} );
	} );

	describe( 'PlaygroundIframe error handling', () => {
		it( 'should render PlaygroundError when initialization fails', async () => {
			initializeWordPressPlayground.mockRejectedValue(
				new PlaygroundNotFoundError(
					'missing-id',
					new Error( 'Error connecting to the SQLite database.' )
				)
			);

			await act( async () => renderPlaygroundStep() );

			// Verify the error component is displayed
			await waitFor( () => {
				expect( screen.getByTestId( 'playground-error' ) ).toBeVisible();
			} );
		} );

		it( 'should not retry initialization on its own when the blueprint cannot be loaded', async () => {
			initializeWordPressPlayground.mockRejectedValue(
				new BlueprintLoadError( 'https://wordpress.com/404', new Error( 'Not Found' ) )
			);

			await act( async () =>
				renderPlaygroundStep(
					{},
					{
						initialEntry:
							'/setup/onboarding/playground?blueprint-url=https%3A%2F%2Fwordpress.com%2F404&playground=missing-id',
					}
				)
			);

			await waitFor( () => {
				expect( screen.getByTestId( 'playground-error' ) ).toHaveTextContent(
					'BlueprintLoadError'
				);
			} );
			expect( initializeWordPressPlayground ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should initialize again only when a new playground is requested', async () => {
			initializeWordPressPlayground
				.mockRejectedValueOnce(
					new PlaygroundNotFoundError( 'missing-id', new Error( 'boot failed' ) )
				)
				.mockResolvedValue( { blueprint: null, client: mockPlaygroundClientInstance } );

			let container;
			await act( async () => {
				const result = renderPlaygroundStep(
					{},
					{ initialEntry: '/setup/onboarding/playground?playground=missing-id' }
				);
				container = result.container;
			} );

			await waitFor( () => {
				expect( screen.getByTestId( 'playground-error' ) ).toHaveTextContent(
					'PlaygroundNotFoundError'
				);
			} );
			expect( initializeWordPressPlayground ).toHaveBeenCalledTimes( 1 );

			await userEvent.click( screen.getByRole( 'button', { name: 'Create new playground' } ) );

			await waitFor( () => {
				expect( container.querySelector( 'iframe' ) ).toBeVisible();
			} );
			expect( initializeWordPressPlayground ).toHaveBeenCalledTimes( 2 );
		} );
	} );
} );
