/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { Step } from '@automattic/onboarding';
import { act, screen, waitFor, within } from '@testing-library/react';
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

	describe( 'leaving the WooCommerce playground', () => {
		const wooEntry = '/setup/onboarding/playground?blueprint=123&playground=1&intent=woocommerce';
		const locationDescriptor = Object.getOwnPropertyDescriptor( window, 'location' );
		const assign = jest.fn();
		let getClientRectsSpy: jest.SpyInstance;

		const getBackButton = () => screen.getByRole( 'button', { name: 'Back' } );
		const getExitButton = () => screen.getByRole( 'button', { name: 'Exit' } );
		const getKeepBuildingButton = () => screen.getByRole( 'button', { name: 'Keep building' } );
		const getContinueButton = () =>
			screen.getByRole( 'button', { name: 'Continue without saving' } );
		const queryLeaveModal = () => screen.queryByRole( 'dialog', { name: 'Leave without saving' } );
		const getLeaveEventNames = () =>
			recordTracksEvent.mock.calls
				.map( ( [ eventName ] ) => eventName )
				.filter( ( eventName ) => eventName.startsWith( 'calypso_playground_leave_modal_' ) );
		const getLeaveEventCalls = () =>
			recordTracksEvent.mock.calls.filter( ( [ eventName ] ) =>
				eventName.startsWith( 'calypso_playground_leave_modal_' )
			);

		const dispatchPageShow = ( persisted: boolean ) => {
			const event = new Event( 'pageshow' );
			Object.defineProperty( event, 'persisted', { value: persisted } );
			act( () => {
				window.dispatchEvent( event );
			} );
		};

		const renderWooPlaygroundStep = async ( props: Partial< StepProps > = {} ) => {
			await act( async () => {
				renderStep(
					<Step.StepContainerV2Provider
						value={ {
							flowName: 'onboarding',
							stepName: 'playground',
							recordTracksEvent,
							logo: null,
						} }
					>
						<PlaygroundStep
							{ ...mockStepProps( { flow: 'onboarding', stepName: 'playground', ...props } ) }
						/>
					</Step.StepContainerV2Provider>,
					{ initialEntry: wooEntry }
				);
			} );
		};

		const continueWithoutSaving = async () => {
			await userEvent.click( getBackButton() );
			await waitFor( () => expect( getKeepBuildingButton() ).toHaveFocus() );
			await userEvent.click( getContinueButton() );
		};

		beforeEach( () => {
			Object.defineProperty( window, 'location', {
				configurable: true,
				value: { ...window.location, assign },
			} );
			// jsdom has no layout, so the Modal can't find a tabbable element to focus on mount.
			getClientRectsSpy = jest
				.spyOn( HTMLElement.prototype, 'getClientRects' )
				.mockReturnValue( [ {} ] as unknown as DOMRectList );
		} );

		afterEach( () => {
			Object.defineProperty( window, 'location', locationDescriptor );
			getClientRectsSpy.mockRestore();
		} );

		it( 'should not show the Back and Exit buttons outside the WooCommerce entry', async () => {
			await act( async () => {
				renderPlaygroundStep(
					{},
					{ initialEntry: '/setup/onboarding/playground?blueprint=123&playground=1' }
				);
			} );

			expect( screen.queryByRole( 'button', { name: 'Back' } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: 'Exit' } ) ).not.toBeInTheDocument();
		} );

		it( 'should show the Back and Exit buttons for the WooCommerce entry', async () => {
			await renderWooPlaygroundStep();

			expect( getBackButton() ).toBeVisible();
			expect( getExitButton() ).toBeVisible();
			expect( queryLeaveModal() ).not.toBeInTheDocument();
		} );

		it( 'should announce that the Back and Exit buttons open a dialog', async () => {
			await renderWooPlaygroundStep();

			expect( getBackButton() ).toHaveAttribute( 'aria-haspopup', 'dialog' );
			expect( getExitButton() ).toHaveAttribute( 'aria-haspopup', 'dialog' );
			expect( screen.queryByRole( 'button', { name: 'Close' } ) ).not.toBeInTheDocument();
		} );

		it.each( [
			[ 'back', getBackButton ],
			[ 'close', getExitButton ],
		] )(
			'should open the leave modal from the %s button and return focus when kept building',
			async ( trigger, getTrigger ) => {
				await renderWooPlaygroundStep();

				await userEvent.click( getTrigger() );

				expect( queryLeaveModal() ).toBeVisible();
				expect( queryLeaveModal() ).toHaveAccessibleDescription(
					'All the store information you’ve entered will be lost if you leave now.'
				);
				await waitFor( () => expect( getKeepBuildingButton() ).toHaveFocus() );

				await userEvent.click( getKeepBuildingButton() );

				expect( queryLeaveModal() ).not.toBeInTheDocument();
				expect( getTrigger() ).toHaveFocus();
				expect( assign ).not.toHaveBeenCalled();
				expect( recordTracksEvent ).not.toHaveBeenCalledWith(
					'calypso_signup_previous_step_button_click',
					expect.anything()
				);
				expect( getLeaveEventCalls() ).toEqual( [
					[
						'calypso_playground_leave_modal_open',
						{
							flow: 'onboarding',
							step: 'playground',
							blueprint: 'bpl-123',
							is_woocommerce_intent: true,
							trigger,
						},
					],
					[
						'calypso_playground_leave_modal_keep_building',
						expect.objectContaining( { trigger, is_woocommerce_intent: true } ),
					],
				] );
			}
		);

		it( 'should keep building when the modal is dismissed with Escape', async () => {
			await renderWooPlaygroundStep();

			await userEvent.click( getExitButton() );
			await waitFor( () => expect( getKeepBuildingButton() ).toHaveFocus() );
			await userEvent.keyboard( '{Escape}' );

			await waitFor( () => expect( queryLeaveModal() ).not.toBeInTheDocument() );
			expect( getExitButton() ).toHaveFocus();
			expect( assign ).not.toHaveBeenCalled();
			expect( getLeaveEventNames() ).toEqual( [
				'calypso_playground_leave_modal_open',
				'calypso_playground_leave_modal_keep_building',
			] );
		} );

		it( 'should record the continue event before sending the user to WooCommerce.com', async () => {
			await renderWooPlaygroundStep();

			await continueWithoutSaving();

			expect( getLeaveEventCalls() ).toEqual( [
				[ 'calypso_playground_leave_modal_open', expect.objectContaining( { trigger: 'back' } ) ],
				[
					'calypso_playground_leave_modal_continue',
					{
						flow: 'onboarding',
						step: 'playground',
						blueprint: 'bpl-123',
						is_woocommerce_intent: true,
						trigger: 'back',
					},
				],
			] );
			// The redirect waits for Tracks to send the event.
			expect( assign ).not.toHaveBeenCalled();
			await waitFor( () =>
				expect( assign ).toHaveBeenCalledWith( 'https://woocommerce.com/start/#hosts' )
			);

			await userEvent.click( getContinueButton() );
			expect( assign ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should ignore every dismissal while leaving', async () => {
			await renderWooPlaygroundStep();

			await continueWithoutSaving();

			expect( getContinueButton() ).toHaveAttribute( 'aria-disabled', 'true' );
			expect( getKeepBuildingButton() ).toHaveAttribute( 'aria-disabled', 'true' );
			expect(
				within( queryLeaveModal() ).queryByRole( 'button', { name: 'Close' } )
			).not.toBeInTheDocument();

			await userEvent.click( getKeepBuildingButton() );
			await userEvent.keyboard( '{Escape}' );
			await userEvent.click(
				document.querySelector( '.components-modal__screen-overlay' ) as HTMLElement
			);

			expect( queryLeaveModal() ).toBeVisible();
			await waitFor( () => expect( assign ).toHaveBeenCalledTimes( 1 ) );
			expect( getLeaveEventNames() ).toEqual( [
				'calypso_playground_leave_modal_open',
				'calypso_playground_leave_modal_continue',
			] );
		} );

		it( 'should close the modal when the page is restored from the back/forward cache', async () => {
			await renderWooPlaygroundStep();

			await continueWithoutSaving();
			await waitFor( () => expect( assign ).toHaveBeenCalledTimes( 1 ) );

			dispatchPageShow( false );
			expect( queryLeaveModal() ).toBeVisible();

			dispatchPageShow( true );
			expect( queryLeaveModal() ).not.toBeInTheDocument();
			expect( getSaveStoreButton() ).toBeEnabled();

			await userEvent.click( getExitButton() );
			expect( queryLeaveModal() ).toBeVisible();
			expect( getContinueButton() ).not.toHaveAttribute( 'aria-disabled' );
		} );

		it( 'should not send the user away when restored before the redirect', async () => {
			await renderWooPlaygroundStep();

			await continueWithoutSaving();
			dispatchPageShow( true );

			await new Promise( ( resolve ) => setTimeout( resolve, 400 ) );
			expect( assign ).not.toHaveBeenCalled();
		} );

		it( 'should not let the user leave while the store is being saved', async () => {
			const submit = jest.fn();
			await renderWooPlaygroundStep( { navigation: { submit } } );

			await userEvent.click( getSaveStoreButton() );
			expect( submit ).toHaveBeenCalledTimes( 1 );

			expect( getBackButton() ).toHaveAttribute( 'aria-disabled', 'true' );
			expect( getExitButton() ).toHaveAttribute( 'aria-disabled', 'true' );

			await userEvent.click( getBackButton() );
			await userEvent.click( getExitButton() );

			expect( queryLeaveModal() ).not.toBeInTheDocument();
			expect( getLeaveEventNames() ).toEqual( [] );
		} );

		it( 'should not let the user save the store while leaving', async () => {
			const submit = jest.fn();
			await renderWooPlaygroundStep( { navigation: { submit } } );

			await continueWithoutSaving();

			// The modal hides the rest of the page from the accessibility tree.
			const saveButton = screen.getByRole( 'button', { name: 'Save my store', hidden: true } );
			expect( saveButton ).toBeDisabled();
			expect( submit ).not.toHaveBeenCalled();
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
