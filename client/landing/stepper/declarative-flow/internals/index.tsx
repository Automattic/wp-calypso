import { Step } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import React, { lazy, useEffect, useMemo } from 'react';
import Modal from 'react-modal';
import { createPath, generatePath, Navigate, useParams } from 'react-router';
import { Route, Routes } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import Loading from 'calypso/components/loading';
import { STEPPER_INTERNAL_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { useFirstStep } from '../../hooks/use-first-step';
import { useSaveQueryParams } from '../../hooks/use-save-query-params';
import { useSiteData } from '../../hooks/use-site-data';
import useSyncRoute from '../../hooks/use-sync-route';
import { useStartStepperPerformanceTracking } from '../../utils/performance-tracking';
import { shouldUseStepContainerV2 } from '../helpers/should-use-step-container-v2';
import { StepRoute } from './components';
import { Boot } from './components/boot';
import { RedirectToStep } from './components/redirect-to-step';
import { useFlowAnalytics } from './hooks/use-flow-analytics';
import { useFlowNavigation } from './hooks/use-flow-navigation';
import { usePreloadSteps, lazyCache } from './hooks/use-preload-steps';
import { useSignUpStartTracking } from './hooks/use-sign-up-start-tracking';
import { useStepNavigationWithTracking } from './hooks/use-step-navigation-with-tracking';
import { PRIVATE_STEPS } from './steps';
import { AssertConditionState, type Flow, type StepperStep } from './types';
import type { StepperInternalSelect } from '@automattic/data-stores';
import './global.scss';

function flowStepComponent( flowStep: StepperStep | undefined ) {
	if ( ! flowStep ) {
		return null;
	}

	let lazyComponent = lazyCache.get( flowStep.asyncComponent );
	if ( ! lazyComponent ) {
		lazyComponent = lazy( flowStep.asyncComponent );
		lazyCache.set( flowStep.asyncComponent, lazyComponent );
	}
	return lazyComponent;
}

/**
 * This component accepts a single flow property. It does the following:
 *
 * 1. It renders a react-router route for every step in the flow.
 * 2. It gives every step the ability to navigate back and forth within the flow
 * 3. It's responsive to the dynamic changes in side the flow's hooks (useSteps and useStepsNavigation)
 * @param props
 * @param props.flow the flow you want to render
 * @param props.steps the steps of the flow.
 * @returns A React router switch will all the routes
 */
export const FlowRenderer: React.FC< { flow: Flow; steps: readonly StepperStep[] | null } > = ( {
	flow,
	steps,
} ) => {
	// Configure app element that React Modal will aria-hide when modal is open
	Modal.setAppElement( '#wpcom' );
	const deprecatedFlowSteps = 'useSteps' in flow ? flow.useSteps() : null;
	const flowSteps = steps ?? deprecatedFlowSteps ?? [];

	const stepPaths = flowSteps.map( ( step ) => step.slug );
	const firstStepSlug = useFirstStep( stepPaths );
	const { navigate, params } = useFlowNavigation( flow );
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
	usePreloadSteps( siteSlugOrId, selectedSite, currentStepRoute, flowSteps, flow );

	const stepNavigation = useStepNavigationWithTracking( {
		flow,
		stepSlugs: stepPaths,
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

	const stepContainerV2Context = useMemo(
		() => ( {
			flowName: flow.name,
			stepName: currentStepRoute,
			recordTracksEvent,
		} ),
		[ flow.name, currentStepRoute ]
	);

	const renderStep = ( step: StepperStep ) => {
		switch ( assertCondition.state ) {
			case AssertConditionState.CHECKING:
				return shouldUseStepContainerV2( flow.name ) ? (
					<Step.Loading />
				) : (
					<Loading className="wpcom-loading__boot" />
				);
			case AssertConditionState.FAILURE:
				console.error( assertCondition.message ); // eslint-disable-line no-console
				return null;
		}

		const StepComponent = flowStepComponent( flowSteps.find( ( { slug } ) => slug === step.slug ) );

		if ( ! StepComponent ) {
			return null;
		}

		// The `nextStep` is available only when logged-out users go to the step that requires auth
		// and are redirected to the user step.
		const postAuthStepSlug = stepData?.nextStep ?? '';
		if ( step.slug === PRIVATE_STEPS.USER.slug && postAuthStepSlug ) {
			const flowSlug = flow.variantSlug ?? flow.name;
			const previousAuthStepSlug = stepData?.previousStep;
			const postAuthStepPath = createPath( {
				pathname: generatePath( '/setup/:flow/:step/:lang?', {
					flow: flowSlug,
					step: postAuthStepSlug,
					lang: lang === 'en' || isLoggedIn ? null : lang,
				} ),
				search: window.location.search,
				hash: window.location.hash,
			} );

			const signupUrl = generatePath( '/setup/:flow/:step/:lang?', {
				flow: flowSlug,
				step: 'user',
				lang: lang === 'en' || isLoggedIn ? null : lang,
			} );

			return (
				<StepComponent
					navigation={ {
						submit() {
							navigate( postAuthStepSlug, undefined, true );
						},
						...( previousAuthStepSlug && {
							goBack() {
								navigate( previousAuthStepSlug, undefined, true );
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

		if ( step.slug === PRIVATE_STEPS.USER.slug ) {
			// In this case, the user step is not able to determine the next step after auth. This happens when users somehow land in /flow/user directly.
			// So we navigate to the landing page of the flow and let the flow decide what to do.
			// If you intend to land in /flow/user, please point your URL to the step itself and Stepper will automatically redirect to the user step if needed.
			return <Navigate to={ `/${ flow.variantSlug ?? flow.name }/` } replace />;
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

	const fallback = shouldUseStepContainerV2( flow.name ) ? (
		<Step.Loading />
	) : (
		<Loading className="wpcom-loading__boot" />
	);

	return (
		<Boot fallback={ fallback }>
			<DocumentHead title={ getDocumentHeadTitle() } />

			<Step.StepContainerV2Provider value={ stepContainerV2Context }>
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
									renderStep={ renderStep }
									navigate={ navigate }
								/>
							}
						/>
					) ) }
					<Route
						path="/:flow/:lang?"
						element={
							<>
								{ fallback }
								<RedirectToStep
									slug={ flow.__experimentalUseBuiltinAuth ? firstStepSlug : stepPaths[ 0 ] }
								/>
							</>
						}
					/>
				</Routes>
			</Step.StepContainerV2Provider>
		</Boot>
	);
};
