import { useEffect, useId, useRef } from 'react';
import type {
	GridAction,
	GridPlan,
	SupportedUrlFriendlyTermType,
	UseAction,
} from '@automattic/plans-grid-next';
import type { WebMcpTool, WebMcpToolRegistry } from '@automattic/webmcp';

type ActionOptions = Parameters< UseAction >[ 0 ];
type PlanAction = { options: ActionOptions; action: GridAction };
type PlansWebMcpOptions = {
	isInSignup: boolean;
	isReady: boolean;
	isModalOpen: boolean;
	plans: GridPlan[] | null;
	interval: SupportedUrlFriendlyTermType;
	intervals: SupportedUrlFriendlyTermType[];
	setInterval: ( interval: SupportedUrlFriendlyTermType ) => void;
	useAction: UseAction;
};

const result = ( value: unknown ) => ( {
	content: [ { type: 'text', text: JSON.stringify( value ) } ],
} );

export function usePlansWebMcp( options: PlansWebMcpOptions ): UseAction {
	const currentRef = useRef( options );
	const actionsRef = useRef( new Map< string, PlanAction >() );
	const selectingRef = useRef( false );
	const requestedIntervalRef = useRef< SupportedUrlFriendlyTermType | undefined >( undefined );

	useEffect( () => {
		currentRef.current = options;
		if ( requestedIntervalRef.current === options.interval ) {
			requestedIntervalRef.current = undefined;
		}
	}, [ options ] );

	useEffect( () => {
		if ( ! options.isModalOpen ) {
			selectingRef.current = false;
		}
	}, [ options.isModalOpen ] );

	useEffect( () => {
		if ( ! options.isInSignup ) {
			return;
		}
		const controller = new AbortController();
		let registry: WebMcpToolRegistry | undefined;
		const reportError = ( error: unknown ) => {
			// eslint-disable-next-line no-console
			console.warn( '[WebMCP] Plans integration failed:', error );
		};
		const isLoading = () => ! currentRef.current.isReady || !! requestedIntervalRef.current;
		const getPlans = () => currentRef.current.plans?.filter( ( plan ) => plan.isVisible ) ?? [];
		const getAction = ( planSlug: string ) =>
			Array.from( actionsRef.current.values() ).find(
				( entry ) =>
					entry.options.planSlug === planSlug &&
					! entry.options.isFreeTrialAction &&
					! entry.options.isStuck
			) ??
			Array.from( actionsRef.current.values() ).find(
				( entry ) => entry.options.planSlug === planSlug && ! entry.options.isFreeTrialAction
			);
		const assertReady = () => {
			if ( isLoading() || selectingRef.current || currentRef.current.isModalOpen ) {
				throw new Error(
					'Wait for the plans to load and finish any open confirmation before continuing.'
				);
			}
		};

		void import( /* webpackChunkName: "webmcp" */ '@automattic/webmcp' )
			.then( ( { getWebMcpModelContext, createWebMcpToolRegistry } ) => {
				if ( controller.signal.aborted ) {
					return;
				}
				const modelContext = getWebMcpModelContext();
				if ( ! modelContext ) {
					return;
				}
				const tools: WebMcpTool[] = [
					{
						name: 'wpcom_get_plans',
						title: 'Get signup plans',
						description:
							'Read the plans offered by the signup grid, current billing interval, available intervals, prices, selected storage add-ons, and action availability. Numeric pricing values are in the smallest currency unit (for example, USD cents); monthly is a monthly equivalent, full is the billing-term total. Checkout confirms final prices and taxes.',
						inputSchema: { type: 'object', properties: {}, additionalProperties: false },
						annotations: { readOnlyHint: true, consequentialHint: false },
						execute: () =>
							result( {
								isLoading: isLoading(),
								interval: currentRef.current.interval,
								availableIntervals: currentRef.current.intervals,
								confirmationOpen: currentRef.current.isModalOpen,
								selectionPending: selectingRef.current,
								priceUnit: 'smallest_currency_unit',
								plans: getPlans().map( ( plan ) => {
									const entry = getAction( plan.planSlug );
									return {
										planSlug: plan.planSlug,
										title: String( plan.planTitle ),
										tagline: typeof plan.tagline === 'string' ? plan.tagline : undefined,
										pricing: plan.pricing,
										canSelect:
											!! entry &&
											entry.action.primary.status !== 'disabled' &&
											entry.action.primary.status !== 'blocked',
										actionLabel: entry ? String( entry.action.primary.text ) : undefined,
										selectedStorageAddOn: entry?.options.selectedStorageAddOn
											? {
													slug: entry.options.selectedStorageAddOn.addOnSlug,
													quantity: entry.options.selectedStorageAddOn.quantity,
												}
											: null,
									};
								} ),
							} ),
					},
					{
						name: 'wpcom_set_plan_billing_interval',
						title: 'Set plan billing interval',
						description:
							'Change the signup billing interval using the page selector. Use an interval from wpcom_get_plans.availableIntervals, then read wpcom_get_plans until isLoading is false and interval matches. Does not select a plan or submit payment.',
						inputSchema: {
							type: 'object',
							properties: {
								interval: { type: 'string', enum: [ 'monthly', 'yearly', '2yearly', '3yearly' ] },
							},
							required: [ 'interval' ],
							additionalProperties: false,
						},
						annotations: { readOnlyHint: false, consequentialHint: false },
						execute: ( { interval } ) => {
							assertReady();
							const current = currentRef.current;
							const offeredInterval = current.intervals.find( ( offered ) => offered === interval );
							if ( ! offeredInterval ) {
								throw new Error(
									'Choose a billing interval from wpcom_get_plans.availableIntervals.'
								);
							}
							if ( offeredInterval !== current.interval ) {
								requestedIntervalRef.current = offeredInterval;
								try {
									current.setInterval( offeredInterval );
								} catch ( error ) {
									requestedIntervalRef.current = undefined;
									throw error;
								}
							}
							return result( {
								requestedInterval: offeredInterval,
								nextAction: 'Read wpcom_get_plans for the updated prices and plan slugs.',
							} );
						},
					},
					{
						name: 'wpcom_select_plan',
						title: 'Select a signup plan',
						description:
							'Choose an offered signup plan through its current page button, retaining the storage selection and confirmation dialogs. This can create the WordPress.com site and continue to checkout or the next onboarding step. Does not submit payment. Inspect the resulting screen before continuing.',
						inputSchema: {
							type: 'object',
							properties: { planSlug: { type: 'string', minLength: 1 } },
							required: [ 'planSlug' ],
							additionalProperties: false,
						},
						annotations: { readOnlyHint: false, consequentialHint: true },
						execute: async ( { planSlug } ) => {
							assertReady();
							const plan = getPlans().find( ( plan ) => plan.planSlug === planSlug );
							const entry = plan && getAction( plan.planSlug );
							if (
								! entry ||
								entry.action.primary.status === 'disabled' ||
								entry.action.primary.status === 'blocked'
							) {
								throw new Error(
									'Choose a selectable planSlug from the current wpcom_get_plans results.'
								);
							}
							selectingRef.current = true;
							try {
								await entry.action.primary.callback();
							} catch ( error ) {
								selectingRef.current = false;
								throw error;
							}
							return result( {
								planActionStarted: true,
								planSlug,
								nextAction: 'Inspect the resulting confirmation, checkout, or onboarding screen.',
							} );
						},
					},
				];
				registry = createWebMcpToolRegistry( {
					modelContext,
					getTools: () =>
						tools.map( ( tool ) => ( {
							...tool,
							execute: async ( input, options ) => {
								try {
									return await tool.execute( input, options );
								} catch ( error ) {
									return {
										...result( {
											error: error instanceof Error ? error.message : String( error ),
										} ),
										isError: true,
									};
								}
							},
						} ) ),
				} );
				void registry.sync().catch( reportError );
			} )
			.catch( reportError );
		return () => {
			controller.abort();
			registry?.dispose();
		};
	}, [ options.isInSignup ] );

	function useWebMcpAction( actionOptions: ActionOptions ) {
		const action = options.useAction( actionOptions );
		const id = useId();
		useEffect( () => {
			if ( ! currentRef.current.isInSignup ) {
				return;
			}
			const actions = actionsRef.current;
			actions.set( id, { options: actionOptions, action } );
			return () => {
				actions.delete( id );
			};
		}, [ id, actionOptions, action ] );
		return action;
	}

	return useWebMcpAction;
}
