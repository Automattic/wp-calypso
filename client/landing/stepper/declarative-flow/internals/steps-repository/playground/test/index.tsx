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
let getClientRectsSpy: jest.SpyInstance;

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
		// jsdom has no layout, so the Modal can't find a tabbable element to focus on mount.
		getClientRectsSpy = jest
			.spyOn( HTMLElement.prototype, 'getClientRects' )
			.mockReturnValue( [ {} ] as unknown as DOMRectList );
	} );

	afterEach( () => {
		getClientRectsSpy.mockRestore();
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
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue to save' } ) );

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

	describe( 'saving the WooCommerce playground', () => {
		const wooEntry = '/setup/onboarding/playground?blueprint=123&playground=1&intent=woocommerce';
		const tracksProps = {
			flow: 'onboarding',
			step: 'playground',
			blueprint: 'bpl-123',
			is_woocommerce_intent: true,
		};
		const querySaveModal = () => screen.queryByRole( 'dialog', { name: 'Save my store' } );
		const getKeepBuildingButton = () => screen.getByRole( 'button', { name: 'Keep building' } );
		const getContinueButton = () => screen.getByRole( 'button', { name: 'Continue to save' } );
		const getSaveEventCalls = () =>
			recordTracksEvent.mock.calls.filter(
				( [ eventName ] ) =>
					eventName.startsWith( 'calypso_playground_save_modal_' ) ||
					eventName === 'calypso_playground_launch_site'
			);

		const renderWooPlaygroundStep = async ( submit = jest.fn() ) => {
			await act( async () => {
				renderPlaygroundStep( { navigation: { submit } }, { initialEntry: wooEntry } );
			} );
		};

		const openSaveModal = async () => {
			await userEvent.click( getSaveStoreButton() );
			await waitFor( () => expect( getKeepBuildingButton() ).toHaveFocus() );
		};

		it( 'should launch directly without the save modal outside the WooCommerce entry', async () => {
			const submit = jest.fn();

			await act( async () => {
				renderPlaygroundStep(
					{ navigation: { submit } },
					{ initialEntry: '/setup/onboarding/playground?blueprint=123&playground=1' }
				);
			} );

			await userEvent.click( getLaunchButton() );

			expect( querySaveModal() ).not.toBeInTheDocument();
			expect( submit ).toHaveBeenCalledTimes( 1 );
			expect( getSaveEventCalls().map( ( [ eventName ] ) => eventName ) ).toEqual( [
				'calypso_playground_launch_site',
			] );
		} );

		it( 'should keep the save store button disabled when playground query parameter is missing', async () => {
			await act( async () => {
				renderPlaygroundStep(
					{},
					{ initialEntry: '/setup/onboarding/playground?blueprint=123&intent=woocommerce' }
				);
			} );

			expect( getSaveStoreButton() ).toBeDisabled();
		} );

		it( 'should open the save modal instead of launching', async () => {
			const submit = jest.fn();
			await renderWooPlaygroundStep( submit );

			await openSaveModal();

			expect( querySaveModal() ).toBeVisible();
			expect(
				screen.getByText( 'Keep your store safe and pick up where you left off anytime.' )
			).toBeVisible();
			expect( screen.getByRole( 'heading', { name: 'When you save, you unlock' } ) ).toBeVisible();
			const benefits = screen.getAllByRole( 'listitem' );
			expect( benefits.map( ( benefit ) => benefit.textContent ) ).toEqual( [
				'Your store, everywhereAccess it anytime from your account',
				'Time to explore14-day free trial. No credit card needed',
				'Only pay when you’re readyLaunch on your own timeline',
			] );
			expect( getContinueButton() ).toBeEnabled();
			expect( submit ).not.toHaveBeenCalled();
			expect( getSaveEventCalls() ).toEqual( [
				[ 'calypso_playground_save_modal_open', tracksProps ],
			] );
		} );

		it.each( [
			[ 'the Keep building button', () => userEvent.click( getKeepBuildingButton() ) ],
			[
				'the close button',
				() =>
					userEvent.click( within( querySaveModal() ).getByRole( 'button', { name: 'Close' } ) ),
			],
			[ 'Escape', () => userEvent.keyboard( '{Escape}' ) ],
			[
				'an outside click',
				() => {
					const overlay = querySaveModal().closest( '.components-modal__screen-overlay' );
					return userEvent.pointer( [
						{ keys: '[MouseLeft>]', target: overlay },
						{ keys: '[/MouseLeft]', target: overlay },
					] );
				},
			],
		] )( 'should keep building and return focus when dismissed with %s', async ( _, dismiss ) => {
			const submit = jest.fn();
			await renderWooPlaygroundStep( submit );

			await openSaveModal();
			await dismiss();

			await waitFor( () => expect( querySaveModal() ).not.toBeInTheDocument() );
			expect( getSaveStoreButton() ).toHaveFocus();
			expect( getSaveStoreButton() ).toBeEnabled();
			expect( submit ).not.toHaveBeenCalled();
			expect( getSaveEventCalls() ).toEqual( [
				[ 'calypso_playground_save_modal_open', tracksProps ],
				[ 'calypso_playground_save_modal_keep_building', tracksProps ],
			] );
		} );

		it( 'should launch the site once when continuing to save', async () => {
			const submit = jest.fn();
			await renderWooPlaygroundStep( submit );

			await openSaveModal();
			await userEvent.click( getContinueButton() );

			expect( submit ).toHaveBeenCalledTimes( 1 );
			expect( getContinueButton() ).toHaveAttribute( 'aria-disabled', 'true' );
			expect(
				screen.getByRole( 'button', { name: 'Save my store', hidden: true } )
			).toBeDisabled();
			expect( getSaveEventCalls() ).toEqual( [
				[ 'calypso_playground_save_modal_open', tracksProps ],
				[ 'calypso_playground_save_modal_continue', tracksProps ],
				[ 'calypso_playground_launch_site', { ...tracksProps, intent: 'plans-playground' } ],
			] );

			await userEvent.click( getContinueButton() );
			await userEvent.keyboard( '{Escape}' );

			expect( querySaveModal() ).toBeVisible();
			expect( submit ).toHaveBeenCalledTimes( 1 );
			expect( getSaveEventCalls() ).toHaveLength( 3 );
		} );
	} );

	describe( 'leaving the WooCommerce playground', () => {
		const wooEntry = '/setup/onboarding/playground?blueprint=123&playground=1&intent=woocommerce';
		const locationDescriptor = Object.getOwnPropertyDescriptor( window, 'location' );
		const assign = jest.fn();

		const getBackButton = () => screen.getByRole( 'button', { name: 'Back' } );
		const getCloseButton = () => screen.getByRole( 'button', { name: 'Close' } );
		const queryLeaveModal = () => screen.queryByRole( 'dialog', { name: 'Leave without saving' } );
		const getLeaveEventCalls = () =>
			recordTracksEvent.mock.calls.filter( ( [ eventName ] ) =>
				eventName.startsWith( 'calypso_playground_leave_modal_' )
			);

		const renderWooPlaygroundStep = async () => {
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
							{ ...mockStepProps( { flow: 'onboarding', stepName: 'playground' } ) }
						/>
					</Step.StepContainerV2Provider>,
					{ initialEntry: wooEntry }
				);
			} );
		};

		beforeEach( () => {
			Object.defineProperty( window, 'location', {
				configurable: true,
				value: { ...window.location, assign },
			} );
		} );

		afterEach( () => {
			Object.defineProperty( window, 'location', locationDescriptor );
		} );

		it( 'should not show the Back and close buttons outside the WooCommerce entry', async () => {
			await act( async () => {
				renderPlaygroundStep(
					{},
					{ initialEntry: '/setup/onboarding/playground?blueprint=123&playground=1' }
				);
			} );

			expect( screen.queryByRole( 'button', { name: 'Back' } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: 'Close' } ) ).not.toBeInTheDocument();
		} );

		it( 'should show the Back and close buttons for the WooCommerce entry', async () => {
			await renderWooPlaygroundStep();

			expect( getBackButton() ).toBeVisible();
			expect( getCloseButton() ).toBeVisible();
			expect( queryLeaveModal() ).not.toBeInTheDocument();
		} );

		it.each( [
			[ 'back', getBackButton ],
			[ 'close', getCloseButton ],
		] )(
			'should open the leave modal from the %s button and return focus when kept building',
			async ( trigger, getTrigger ) => {
				await renderWooPlaygroundStep();

				await userEvent.click( getTrigger() );

				expect( queryLeaveModal() ).toBeVisible();
				expect(
					screen.getByText(
						'All the store information you’ve entered will be lost if you leave now.'
					)
				).toBeVisible();
				await waitFor( () =>
					expect( screen.getByRole( 'button', { name: 'Keep building' } ) ).toHaveFocus()
				);

				await userEvent.click( screen.getByRole( 'button', { name: 'Keep building' } ) );

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

			await userEvent.click( getCloseButton() );
			await waitFor( () =>
				expect( screen.getByRole( 'button', { name: 'Keep building' } ) ).toHaveFocus()
			);
			await userEvent.keyboard( '{Escape}' );

			await waitFor( () => expect( queryLeaveModal() ).not.toBeInTheDocument() );
			expect( getCloseButton() ).toHaveFocus();
			expect( assign ).not.toHaveBeenCalled();
			expect( getLeaveEventCalls().map( ( [ eventName ] ) => eventName ) ).toEqual( [
				'calypso_playground_leave_modal_open',
				'calypso_playground_leave_modal_keep_building',
			] );
		} );

		it( 'should send the user to WooCommerce.com when continuing without saving', async () => {
			await renderWooPlaygroundStep();

			await userEvent.click( getBackButton() );
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue without saving' } ) );

			expect( assign ).toHaveBeenCalledWith( 'https://woocommerce.com/start/#hosts' );
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

			await userEvent.click( screen.getByRole( 'button', { name: 'Continue without saving' } ) );
			expect( assign ).toHaveBeenCalledTimes( 1 );
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
