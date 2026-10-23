/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { Step } from '@automattic/onboarding';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { logToLogstash } from 'calypso/lib/logstash';
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

jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn( () => Promise.resolve() ),
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
		...mockStepProps( {
			flow: 'onboarding',
			stepName: 'playground',
			navigation: { submit: jest.fn() },
			...props,
		} ),
	};

	return renderStep( <PlaygroundStep { ...combinedProps } />, renderOptions );
};

const getLaunchButton = () => screen.getByRole( 'button', { name: 'Launch on WordPress.com' } );
const getSaveStoreButton = () => screen.getByRole( 'button', { name: 'Save my store' } );

describe( 'Playground', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		recordTracksEvent.mockReset();
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
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue to WordPress.com' } ) );

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
		const getContinueButton = () =>
			screen.getByRole( 'button', { name: 'Continue to WordPress.com' } );
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
				screen.getByText(
					'Your store will be saved to WordPress.com. Access it anytime from your account to continue building or go live.'
				)
			).toBeVisible();
			expect( querySaveModal() ).toHaveAccessibleDescription(
				'Your store will be saved to WordPress.com. Access it anytime from your account to continue building or go live.'
			);
			expect( screen.getByRole( 'heading', { name: 'When you save, you unlock:' } ) ).toBeVisible();
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

			await waitFor( () => expect( submit ).toHaveBeenCalledTimes( 1 ) );
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

		it( 'should announce that the save store button opens a dialog', async () => {
			await renderWooPlaygroundStep();

			expect( getSaveStoreButton() ).toHaveAttribute( 'aria-haspopup', 'dialog' );
		} );

		it( 'should not announce a dialog for the launch button outside the WooCommerce entry', async () => {
			await act( async () => {
				renderPlaygroundStep(
					{},
					{ initialEntry: '/setup/onboarding/playground?blueprint=123&playground=1' }
				);
			} );

			expect( getLaunchButton() ).not.toHaveAttribute( 'aria-haspopup' );
		} );

		it( 'should not open the save modal when the step cannot submit', async () => {
			await act( async () => {
				renderPlaygroundStep( { navigation: {} }, { initialEntry: wooEntry } );
			} );

			expect( getSaveStoreButton() ).toBeDisabled();
			await userEvent.click( getSaveStoreButton() );

			expect( querySaveModal() ).not.toBeInTheDocument();
			expect( getSaveEventCalls() ).toEqual( [] );
		} );

		it( 'should submit straight away and leave the wait for Tracks to the flow', async () => {
			const submit = jest.fn();
			await renderWooPlaygroundStep( submit );

			await openSaveModal();
			await userEvent.click( getContinueButton() );

			expect( submit ).toHaveBeenCalledTimes( 1 );
		} );

		describe( 'when the launch fails', () => {
			const getFailedEventCalls = () =>
				recordTracksEvent.mock.calls.filter(
					( [ eventName ] ) => eventName === 'calypso_playground_launch_site_failed'
				);

			it( 'should let the user try again and record the failure', async () => {
				const submit = jest
					.fn()
					.mockImplementationOnce( () => {
						throw new Error( 'Routing failed' );
					} )
					.mockImplementation( () => {} );
				await renderWooPlaygroundStep( submit );

				await openSaveModal();
				await userEvent.click( getContinueButton() );

				expect( submit ).toHaveBeenCalledTimes( 1 );
				expect( querySaveModal() ).toBeVisible();
				expect( getContinueButton() ).not.toHaveAttribute( 'aria-disabled' );
				expect( getSaveEventCalls().map( ( [ eventName ] ) => eventName ) ).toEqual( [
					'calypso_playground_save_modal_open',
					'calypso_playground_save_modal_continue',
					'calypso_playground_launch_site',
				] );
				expect( getFailedEventCalls() ).toEqual( [
					[
						'calypso_playground_launch_site_failed',
						{ ...tracksProps, intent: 'plans-playground', error_message: 'Routing failed' },
					],
				] );
				expect( logToLogstash ).toHaveBeenCalledWith(
					expect.objectContaining( {
						feature: 'calypso_client',
						tags: [ 'playground-launch' ],
						message: 'Routing failed',
						properties: expect.objectContaining( { ...tracksProps, intent: 'plans-playground' } ),
					} )
				);

				await userEvent.click( getContinueButton() );

				expect( submit ).toHaveBeenCalledTimes( 2 );
				expect( getFailedEventCalls() ).toHaveLength( 1 );
			} );

			it( 'should not stay busy when recording the launch event throws', async () => {
				const submit = jest.fn();
				recordTracksEvent.mockImplementation( ( eventName ) => {
					if ( eventName === 'calypso_playground_launch_site' ) {
						throw new Error( 'Tracks failed' );
					}
				} );
				await renderWooPlaygroundStep( submit );

				await openSaveModal();
				await userEvent.click( getContinueButton() );

				expect( submit ).not.toHaveBeenCalled();
				expect( getContinueButton() ).not.toHaveAttribute( 'aria-disabled' );
				expect( getKeepBuildingButton() ).not.toHaveAttribute( 'aria-disabled' );
				expect( getFailedEventCalls() ).toEqual( [
					[
						'calypso_playground_launch_site_failed',
						expect.objectContaining( { error_message: 'Tracks failed' } ),
					],
				] );
			} );
		} );

		it( 'should close the modal when the page is restored from the back/forward cache', async () => {
			const submit = jest.fn();
			await renderWooPlaygroundStep( submit );

			await openSaveModal();
			await userEvent.click( getContinueButton() );
			expect( getContinueButton() ).toHaveAttribute( 'aria-disabled', 'true' );

			const event = new Event( 'pageshow' );
			Object.defineProperty( event, 'persisted', { value: true } );
			act( () => {
				window.dispatchEvent( event );
			} );

			expect( querySaveModal() ).not.toBeInTheDocument();
			expect( getSaveStoreButton() ).toBeEnabled();
			expect( screen.getByRole( 'button', { name: 'Exit' } ) ).not.toHaveAttribute(
				'aria-disabled'
			);

			await openSaveModal();
			expect( getContinueButton() ).not.toHaveAttribute( 'aria-disabled' );
		} );
	} );

	describe( 'leaving the WooCommerce playground', () => {
		const wooEntry = '/setup/onboarding/playground?blueprint=123&playground=1&intent=woocommerce';
		const locationDescriptor = Object.getOwnPropertyDescriptor( window, 'location' );
		const assign = jest.fn();

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
							{ ...mockStepProps( {
								flow: 'onboarding',
								stepName: 'playground',
								navigation: { submit: jest.fn() },
								...props,
							} ) }
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
		} );

		afterEach( () => {
			Object.defineProperty( window, 'location', locationDescriptor );
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

		it( 'should redirect once when Continue is handled twice before the step re-renders', async () => {
			await renderWooPlaygroundStep();

			await userEvent.click( getBackButton() );
			await waitFor( () => expect( getKeepBuildingButton() ).toHaveFocus() );
			const continueButton = getContinueButton();
			// Two clicks in one act() run before React re-renders, so both see the step as idle.
			act( () => {
				continueButton.click();
				continueButton.click();
			} );

			await new Promise( ( resolve ) => setTimeout( resolve, 400 ) );
			expect( assign ).toHaveBeenCalledTimes( 1 );
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
			await userEvent.click( screen.getByRole( 'button', { name: 'Continue to WordPress.com' } ) );
			await waitFor( () => expect( submit ).toHaveBeenCalledTimes( 1 ) );

			// The save modal hides the rest of the page from the accessibility tree.
			const backButton = screen.getByRole( 'button', { name: 'Back', hidden: true } );
			const exitButton = screen.getByRole( 'button', { name: 'Exit', hidden: true } );
			expect( backButton ).toHaveAttribute( 'aria-disabled', 'true' );
			expect( exitButton ).toHaveAttribute( 'aria-disabled', 'true' );

			await userEvent.click( backButton );
			await userEvent.click( exitButton );

			expect( queryLeaveModal() ).not.toBeInTheDocument();
			expect( getLeaveEventNames() ).toEqual( [] );
		} );

		it( 'should not open the leave modal while the save modal is open', async () => {
			await renderWooPlaygroundStep();

			await userEvent.click( getSaveStoreButton() );
			await userEvent.click( screen.getByRole( 'button', { name: 'Exit', hidden: true } ) );

			expect( screen.getByRole( 'dialog', { name: 'Save my store' } ) ).toBeVisible();
			expect( screen.getAllByRole( 'dialog' ) ).toHaveLength( 1 );
			expect( getLeaveEventNames() ).toEqual( [] );
		} );

		it( 'should not open the save modal while the leave modal is open', async () => {
			await renderWooPlaygroundStep();

			await userEvent.click( getBackButton() );
			await userEvent.click(
				screen.getByRole( 'button', { name: 'Save my store', hidden: true } )
			);

			expect( queryLeaveModal() ).toBeVisible();
			expect( screen.getAllByRole( 'dialog' ) ).toHaveLength( 1 );
			expect(
				recordTracksEvent.mock.calls.filter( ( [ eventName ] ) =>
					eventName.startsWith( 'calypso_playground_save_modal_' )
				)
			).toEqual( [] );
		} );

		it( 'should not let the user save the store while leaving', async () => {
			const submit = jest.fn();
			await renderWooPlaygroundStep( { navigation: { submit } } );

			await continueWithoutSaving();

			// The modal hides the rest of the page from the accessibility tree.
			const saveButton = screen.getByRole( 'button', { name: 'Save my store', hidden: true } );
			expect( saveButton ).toBeDisabled();
			await userEvent.click( saveButton );

			expect( screen.queryByRole( 'dialog', { name: 'Save my store' } ) ).not.toBeInTheDocument();
			expect( submit ).not.toHaveBeenCalled();
			expect(
				recordTracksEvent.mock.calls.filter( ( [ eventName ] ) =>
					eventName.startsWith( 'calypso_playground_save_modal_' )
				)
			).toEqual( [] );
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
