import { isWooExpressFlow } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import React, { lazy, useEffect } from 'react';
import Modal from 'react-modal';
import { generatePath, useParams } from 'react-router';
import { Route, Routes } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { STEPPER_INTERNAL_STORE } from 'calypso/landing/stepper/stores';
import AsyncCheckoutModal from 'calypso/my-sites/checkout/modal/async';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { useFirstStep } from '../../hooks/use-first-step';
import { useSaveQueryParams } from '../../hooks/use-save-query-params';
import { useSiteData } from '../../hooks/use-site-data';
import useSyncRoute from '../../hooks/use-sync-route';
import { useStartStepperPerformanceTracking } from '../../utils/performance-tracking';
import { StepperLoader, StepRoute } from './components';
import { Boot } from './components/boot';
import { RedirectToStep } from './components/redirect-to-step';
import { useFlowAnalytics } from './hooks/use-flow-analytics';
import { useFlowNavigation } from './hooks/use-flow-navigation';
import { useSignUpStartTracking } from './hooks/use-sign-up-start-tracking';
import { useStepNavigationWithTracking } from './hooks/use-step-navigation-with-tracking';
import { AssertConditionState, type Flow, type StepperStep, type StepProps } from './types';
import type { StepperInternalSelect } from '@automattic/data-stores';
import './global.scss';

const lazyCache = new WeakMap<
	() => Promise< {
		default: React.ComponentType< StepProps >;
	} >,
	React.ComponentType< StepProps >
>();

function flowStepComponent( flowStep: StepperStep | undefined ) {
	if ( ! flowStep ) {
		return null;
	}

	if ( 'asyncComponent' in flowStep ) {
		let lazyComponent = lazyCache.get( flowStep.asyncComponent );
		if ( ! lazyComponent ) {
			lazyComponent = lazy( flowStep.asyncComponent );
			lazyCache.set( flowStep.asyncComponent, lazyComponent );
		}
		return lazyComponent;
	}

	return flowStep.component;
}

/**
 * This component accepts a single flow property. It does the following:
 *
 * 1. It renders a react-router route for every step in the flow.
 * 2. It gives every step the ability to navigate back and forth within the flow
 * 3. It's responsive to the dynamic changes in side the flow's hooks (useSteps and useStepsNavigation)
 * @param props
 * @param props.flow the flow you want to render
 * @returns A React router switch will all the routes
 */
export const FlowRenderer: React.FC< { flow: Flow } > = ( { flow } ) => {
	// Configure app element that React Modal will aria-hide when modal is open
	Modal.setAppElement( '#wpcom' );
	const flowSteps = flow.useSteps();
	const stepPaths = flowSteps.map( ( step ) => step.slug );
	const firstStepSlug = useFirstStep( stepPaths );
	const { navigate, params } = useFlowNavigation();
	const currentStepRoute = params.step || '';
	const isLoggedIn = useSelector( isUserLoggedIn );
	const { lang = null } = useParams();
	const isValidStep = params.step != null && stepPaths.includes( params.step );

	// Start tracking performance for this step.
	useStartStepperPerformanceTracking( params.flow || '', currentStepRoute );
	useFlowAnalytics(
		{ flow: params.flow, step: params.step, variant: flow.variantSlug },
		{ enabled: isValidStep }
	);

	const { __ } = useI18n();
	useSaveQueryParams();

	const { site, siteSlugOrId } = useSiteData();

	// Ensure that the selected site is fetched, if available. This is used for event tracking purposes.
	// See https://github.com/Automattic/wp-calypso/pull/82981.
	const selectedSite = useSelector( ( state ) => site && getSite( state, siteSlugOrId ) );

	// this pre-loads the next step in the flow.
	useEffect( () => {
		const nextStepIndex = flowSteps.findIndex( ( step ) => step.slug === currentStepRoute ) + 1;
		const nextStep = flowSteps[ nextStepIndex ];

		// 0 implies the findIndex returned -1.
		if ( nextStepIndex === 0 || ! nextStep ) {
			return;
		}

		if ( siteSlugOrId && ! selectedSite ) {
			// If this step depends on a selected site, only preload after we have the data.
			// Otherwise, we're still waiting to render something meaningful, and we don't want to
			// potentially slow that down by having the CPU busy initialising future steps.
			return;
		}
		if (
			// Don't load anything on user step because the user step will hard-navigate anyways.
			currentStepRoute !== 'user' &&
			'asyncComponent' in nextStep
		) {
			nextStep.asyncComponent();
		}
		// Most flows sadly instantiate a new steps array on every call to `flow.useSteps()`,
		// which means that we don't want to depend on `flowSteps` here, or this would end up
		// running on every render. We thus depend on `flow` instead.
		//
		// This should be safe, because flows shouldn't return different lists of steps at
		// different points. But even if they do, worst case scenario we only fail to preload
		// some steps, and they'll simply be loaded later.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ siteSlugOrId, selectedSite, currentStepRoute, flow ] );

	const stepNavigation = useStepNavigationWithTracking( {
		flow,
		currentStepRoute,
		navigate,
	} );

	// Retrieve any extra step data from the stepper-internal store. This will be passed as a prop to the current step.
	const stepData = useSelect(
		( select ) => ( select( STEPPER_INTERNAL_STORE ) as StepperInternalSelect ).getStepData(),
		[]
	);

	flow.useSideEffect?.( currentStepRoute, navigate );

	useSyncRoute();

	useEffect( () => {
		window.scrollTo( 0, 0 );
	}, [ currentStepRoute ] );

	const assertCondition = flow.useAssertConditions?.( navigate ) ?? {
		state: AssertConditionState.SUCCESS,
	};

	const renderStep = ( step: StepperStep ) => {
		switch ( assertCondition.state ) {
			case AssertConditionState.CHECKING:
				return <StepperLoader />;
			case AssertConditionState.FAILURE:
				return null;
		}

		const StepComponent = flowStepComponent( flowSteps.find( ( { slug } ) => slug === step.slug ) );

		if ( ! StepComponent ) {
			return null;
		}

		const firstAuthWalledStep = flowSteps.find( ( step ) => step.requiresLoggedInUser );

		if ( step.slug === 'user' && firstAuthWalledStep ) {
			const postAuthStepPath = generatePath( '/setup/:flow/:step/:lang?', {
				flow: flow.name,
				step: firstAuthWalledStep.slug,
				lang: lang === 'en' || isLoggedIn ? null : lang,
			} );
			const signupUrl = generatePath( '/setup/:flow/:step/:lang?', {
				flow: flow.name,
				step: 'user',
				lang: lang === 'en' || isLoggedIn ? null : lang,
			} );

			const lastPreAuthWalledStepIndex =
				flowSteps.findIndex( ( step ) => step.slug === 'user' ) - 1;
			const lastPreAuthWalledStep =
				lastPreAuthWalledStepIndex < 0 ? null : flowSteps[ lastPreAuthWalledStepIndex ];

			return (
				<StepComponent
					navigation={ {
						submit() {
							navigate( firstAuthWalledStep.slug, undefined, true );
						},
						...( lastPreAuthWalledStep && {
							goBack() {
								navigate( lastPreAuthWalledStep.slug, undefined, true );
							},
						} ),
					} }
					flow={ flow.name }
					variantSlug={ flow.variantSlug }
					stepName="user"
					redirectTo={ postAuthStepPath }
					signupUrl={ signupUrl }
				/>
			);
		}

		return (
			<StepComponent
				navigation={ stepNavigation }
				flow={ flow.name }
				variantSlug={ flow.variantSlug }
				stepName={ step.slug }
				data={ stepData }
			/>
		);
	};

	const getDocumentHeadTitle = () => {
		return flow.title ?? __( 'Create a site' );
	};

	useSignUpStartTracking( { flow } );

	return (
		<Boot fallback={ <StepperLoader /> }>
			<DocumentHead title={ getDocumentHeadTitle() } />

			<Routes>
				{ flowSteps.map( ( step ) => (
					<Route
						key={ step.slug }
						path={ `/${ flow.variantSlug ?? flow.name }/${ step.slug }/:lang?` }
						element={
							<StepRoute
								key={ step.slug }
								step={ step }
								flow={ flow }
								showWooLogo={ isWooExpressFlow( flow.name ) }
								renderStep={ renderStep }
								navigate={ navigate }
							/>
						}
					/>
				) ) }
				<Route
					path="/:flow/:lang?"
					element={
						<RedirectToStep
							slug={ flow.__experimentalUseBuiltinAuth ? firstStepSlug : stepPaths[ 0 ] }
						/>
					}
				/>
			</Routes>
			<AsyncCheckoutModal siteId={ site?.ID } />
		</Boot>
	);
};
