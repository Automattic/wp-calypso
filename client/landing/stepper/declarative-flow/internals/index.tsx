import {
	isNewsletterOrLinkInBioFlow,
	isSenseiFlow,
	isWooExpressFlow,
} from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import React, { useEffect, useMemo, lazy } from 'react';
import Modal from 'react-modal';
import { generatePath, useParams } from 'react-router';
import { Route, Routes } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { STEPPER_INTERNAL_STORE } from 'calypso/landing/stepper/stores';
import AsyncCheckoutModal from 'calypso/my-sites/checkout/modal/async';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { useSaveQueryParams } from '../../hooks/use-save-query-params';
import { useSiteData } from '../../hooks/use-site-data';
import useSyncRoute from '../../hooks/use-sync-route';
import { useStartStepperPerformanceTracking } from '../../utils/performance-tracking';
import { StepRoute, StepperLoader } from './components';
import { Boot } from './components/boot';
import { RedirectToStep } from './components/redirect-to-step';
import { useFlowAnalytics } from './hooks/use-flow-analytics';
import { useFlowNavigation } from './hooks/use-flow-navigation';
import { useSignUpStartTracking } from './hooks/use-sign-up-start-tracking';
import { useStepNavigationWithTracking } from './hooks/use-step-navigation-with-tracking';
import { AssertConditionState, type Flow, type StepperStep, type StepProps } from './types';
import type { StepperInternalSelect } from '@automattic/data-stores';
import './global.scss';

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
	const firstAuthWalledStep = flowSteps.find( ( step ) => step.requiresLoggedInUser );
	const stepPaths = flowSteps.map( ( step ) => step.slug );
	const { navigate, params } = useFlowNavigation();
	const currentStepRoute = params.step || '';
	const isLoggedIn = useSelector( isUserLoggedIn );
	const { lang = null } = useParams();

	const postAuthStepPath = generatePath( '/setup/:flow/:step/:lang?', {
		flow: flow.name,
		step: firstAuthWalledStep?.slug ?? null,
		lang: lang === 'en' || isLoggedIn ? null : lang,
	} );

	// Start tracking performance for this step.
	useStartStepperPerformanceTracking( params.flow || '', currentStepRoute );
	useFlowAnalytics( { flow: params.flow, step: currentStepRoute, variant: flow.variantSlug } );

	const stepComponents: Record< string, React.FC< StepProps > > = useMemo(
		() =>
			flowSteps.reduce(
				( acc, flowStep ) => ( {
					...acc,
					[ flowStep.slug ]:
						'asyncComponent' in flowStep ? lazy( flowStep.asyncComponent ) : flowStep.component,
				} ),
				{}
			),
		[ flowSteps ]
	);

	const { __ } = useI18n();
	useSaveQueryParams();

	const { site, siteSlugOrId } = useSiteData();

	// Ensure that the selected site is fetched, if available. This is used for event tracking purposes.
	// See https://github.com/Automattic/wp-calypso/pull/82981.
	const selectedSite = useSelector( ( state ) => site && getSite( state, siteSlugOrId ) );

	// this pre-loads all the lazy steps down the flow.
	useEffect( () => {
		if ( siteSlugOrId && ! selectedSite ) {
			// If this step depends on a selected site, only preload after we have the data.
			// Otherwise, we're still waiting to render something meaningful, and we don't want to
			// potentially slow that down by having the CPU busy initialising future steps.
			return;
		}
		Promise.all( flowSteps.map( ( step ) => 'asyncComponent' in step && step.asyncComponent() ) );
		// Most flows sadly instantiate a new steps array on every call to `flow.useSteps()`,
		// which means that we don't want to depend on `flowSteps` here, or this would end up
		// running on every render. We thus depend on `flow` instead.
		//
		// This should be safe, because flows shouldn't return different lists of steps at
		// different points. But even if they do, worst case scenario we only fail to preload
		// some steps, and they'll simply be loaded later.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ flow, siteSlugOrId, selectedSite ] );

	const stepNavigation = useStepNavigationWithTracking( {
		flow,
		currentStepRoute,
		navigate,
		steps: flowSteps,
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

		const StepComponent = stepComponents[ step.slug ];

		if ( step.slug === 'user' && firstAuthWalledStep ) {
			return (
				<StepComponent
					navigation={ stepNavigation }
					flow={ flow.name }
					variantSlug={ flow.variantSlug }
					stepName="user"
					// We need this special case, because the user step requires an _redirectTo prop.
					// It cannot submit like a normal step would, because then the flow would have to handle the submission.
					// Instead, it will redirect to `_redirectTo` to take the user to the right step.
					_redirectTo={ postAuthStepPath }
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
		if ( isNewsletterOrLinkInBioFlow( flow.name ) ) {
			return flow.title;
		} else if ( isSenseiFlow( flow.name ) ) {
			return __( 'Course Creator' );
		}
	};

	useSignUpStartTracking( { flow, currentStepRoute: currentStepRoute } );

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
								step={ step }
								flow={ flow }
								showWooLogo={ isWooExpressFlow( flow.name ) }
								renderStep={ renderStep }
								navigate={ navigate }
							/>
						}
					/>
				) ) }
				<Route path="/:flow/:lang?" element={ <RedirectToStep slug={ stepPaths[ 0 ] } /> } />
			</Routes>
			<AsyncCheckoutModal siteId={ site?.ID } />
		</Boot>
	);
};
