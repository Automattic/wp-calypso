import {
	isNewsletterOrLinkInBioFlow,
	isSenseiFlow,
	isWooExpressFlow,
} from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import React, { useEffect, useMemo, Suspense, lazy } from 'react';
import Modal from 'react-modal';
import { Navigate, Route, Routes, generatePath, useNavigate, useLocation } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { STEPPER_INTERNAL_STORE } from 'calypso/landing/stepper/stores';
import AsyncCheckoutModal from 'calypso/my-sites/checkout/modal/async';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import { useSaveQueryParams } from '../../hooks/use-save-query-params';
import { useSiteData } from '../../hooks/use-site-data';
import useSyncRoute from '../../hooks/use-sync-route';
import { ONBOARD_STORE } from '../../stores';
import { StepRoute, StepperLoader } from './components';
import { AssertConditionState, type Flow, type StepperStep, type StepProps } from './types';
import type { OnboardSelect, StepperInternalSelect } from '@automattic/data-stores';
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
	const stepPaths = flowSteps.map( ( step ) => step.slug );
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

	const location = useLocation();
	const currentStepRoute = location.pathname.split( '/' )[ 2 ]?.replace( /\/+$/, '' );
	const { __ } = useI18n();
	const navigate = useNavigate();
	const { setStepData } = useDispatch( STEPPER_INTERNAL_STORE );
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);

	useSaveQueryParams();
	// const find_a_solution_to_ref;
	// const ref = useQuery().get( 'ref' ) || '';

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

	// const isFlowStart = useCallback( () => {
	// 	if ( ! flow || ! stepPaths.length ) {
	// 		return false;
	// 	}

	// 	// Double check if we still need it
	// 	if ( flow.name === SENSEI_FLOW ) {
	// 		return currentStepRoute === stepPaths[ 1 ];
	// 	}

	// 	return currentStepRoute === stepPaths[ 0 ];
	// }, [ flow, currentStepRoute, ...stepPaths ] );

	const _navigate = async ( path: string, extraData = {} ) => {
		// If any extra data is passed to the navigate() function, store it to the stepper-internal store.
		setStepData( {
			path: path,
			intent: intent,
			previousStep: currentStepRoute,
			...extraData,
		} );

		const _path = path.includes( '?' ) // does path contain search params
			? generatePath( `/${ flow.variantSlug ?? flow.name }/${ path }` )
			: generatePath( `/${ flow.variantSlug ?? flow.name }/${ path }${ window.location.search }` );

		navigate( _path, { state: stepPaths } );
	};

	const stepNavigation = flow.useStepNavigation(
		currentStepRoute,
		_navigate,
		flowSteps.map( ( step ) => step.slug )
	);

	// Retrieve any extra step data from the stepper-internal store. This will be passed as a prop to the current step.
	const stepData = useSelect(
		( select ) => ( select( STEPPER_INTERNAL_STORE ) as StepperInternalSelect ).getStepData(),
		[]
	);

	flow.useSideEffect?.( currentStepRoute, _navigate );

	useSyncRoute();

	useEffect( () => {
		window.scrollTo( 0, 0 );
	}, [ location ] );

	const assertCondition = flow.useAssertConditions?.( _navigate ) ?? {
		state: AssertConditionState.SUCCESS,
	};

	const renderStep = ( step: StepperStep ) => {
		switch ( assertCondition.state ) {
			case AssertConditionState.CHECKING:
				/* eslint-disable wpcalypso/jsx-classname-namespace */
				return <StepperLoader />;
			/* eslint-enable wpcalypso/jsx-classname-namespace */
			case AssertConditionState.FAILURE:
				return null;
		}

		const StepComponent = stepComponents[ step.slug ];

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

	return (
		<Suspense fallback={ <StepperLoader /> }>
			<DocumentHead title={ getDocumentHeadTitle() } />
			<Routes>
				{ flowSteps.map( ( step ) => (
					<Route
						key={ step.slug }
						path={ `/${ flow.variantSlug ?? flow.name }/${ step.slug }` }
						element={
							<StepRoute
								step={ step }
								flow={ flow }
								showWooLogo={ isWooExpressFlow( flow.name ) }
								renderStep={ renderStep }
							/>
						}
					/>
				) ) }
				<Route
					path="*"
					element={
						<Navigate
							to={ `/${ flow.variantSlug ?? flow.name }/${ stepPaths[ 0 ] }${
								window.location.search
							}` }
							replace
						/>
					}
				/>
			</Routes>
			<AsyncCheckoutModal siteId={ site?.ID } />
		</Suspense>
	);
};
