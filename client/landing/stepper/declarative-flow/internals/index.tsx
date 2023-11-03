import {
	isAnyHostingFlow,
	isNewsletterOrLinkInBioFlow,
	isSenseiFlow,
	isWooExpressFlow,
} from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import React, { useEffect, useState, useCallback, useMemo, Suspense, lazy } from 'react';
import Modal from 'react-modal';
import { Navigate, Route, Routes, generatePath, useNavigate, useLocation } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { STEPPER_INTERNAL_STORE } from 'calypso/landing/stepper/stores';
import { recordPageView } from 'calypso/lib/analytics/page-view';
import { recordSignupStart } from 'calypso/lib/analytics/signup';
import AsyncCheckoutModal from 'calypso/my-sites/checkout/modal/async';
import {
	getSignupCompleteFlowNameAndClear,
	getSignupCompleteStepNameAndClear,
} from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { getSite, isRequestingSite } from 'calypso/state/sites/selectors';
import { useSiteData } from '../../hooks/use-site-data';
import useSyncRoute from '../../hooks/use-sync-route';
import { ONBOARD_STORE } from '../../stores';
import kebabCase from '../../utils/kebabCase';
import { getAssemblerSource } from './analytics/record-design';
import recordStepStart from './analytics/record-step-start';
import StepRoute from './components/step-route';
import StepperLoader from './components/stepper-loader';
import { AssertConditionState, Flow, StepperStep, StepProps } from './types';
import './global.scss';
import type { OnboardSelect, StepperInternalSelect } from '@automattic/data-stores';

/**
 * This component accepts a single flow property. It does the following:
 *
 * 1. It renders a react-router route for every step in the flow.
 * 2. It gives every step the ability to navigate back and forth within the flow
 * 3. It's responsive to the dynamic changes in side the flow's hooks (useSteps and useStepsNavigation)
 *
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
		[ stepPaths ]
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
	const design = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
		[]
	);

	const urlQueryParams = useQuery();
	const ref = urlQueryParams.get( 'ref' ) || '';

	const { site, siteSlugOrId } = useSiteData();

	// Ensure that the selected site is fetched, if available. This is used for event tracking purposes.
	// See https://github.com/Automattic/wp-calypso/pull/82981.
	const selectedSite = useSelector( ( state ) => site && getSite( state, siteSlugOrId ) );
	const isRequestingSelectedSite = useSelector(
		( state ) => site && isRequestingSite( state, siteSlugOrId )
	);

	// Short-circuit this if the site slug or ID is not available.
	const hasRequestedSelectedSite = siteSlugOrId
		? !! selectedSite && ! isRequestingSelectedSite
		: true;

	const stepProgress = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getStepProgress(),
		[]
	);
	const progressValue = stepProgress ? stepProgress.progress / stepProgress.count : 0;
	const [ previousProgress, setPreviousProgress ] = useState(
		stepProgress ? stepProgress.progress : 0
	);
	const previousProgressValue = stepProgress ? previousProgress / stepProgress.count : 0;

	// this pre-loads all the lazy steps down the flow.
	useEffect( () => {
		Promise.all( flowSteps.map( ( step ) => 'asyncComponent' in step && step.asyncComponent() ) );
	}, stepPaths );

	const isFlowStart = useCallback( () => {
		if ( ! flow || ! stepProgress ) {
			return false;
		}
		if ( stepProgress?.progress === 0 ) {
			return true;
		}
		if ( flow.name === 'sensei' && stepProgress?.progress === 1 ) {
			return true;
		}
		return false;
	}, [ flow, stepProgress ] );

	const _navigate = async ( path: string, extraData = {} ) => {
		// If any extra data is passed to the navigate() function, store it to the stepper-internal store.
		setStepData( {
			path: path,
			intent: intent,
			...extraData,
		} );

		const _path = path.includes( '?' ) // does path contain search params
			? generatePath( `/${ flow.variantSlug ?? flow.name }/${ path }` )
			: generatePath( `/${ flow.variantSlug ?? flow.name }/${ path }${ window.location.search }` );

		navigate( _path, { state: stepPaths } );
		setPreviousProgress( stepProgress?.progress ?? 0 );
	};

	const stepNavigation = flow.useStepNavigation( currentStepRoute, _navigate );

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

	useEffect( () => {
		if ( isFlowStart() ) {
			recordSignupStart( flow.name, ref );
		}
	}, [ flow, ref, isFlowStart ] );

	useEffect( () => {
		// We record the event only when the step is not empty. Additionally, we should not fire this event whenever the intent is changed
		if ( ! currentStepRoute || ! hasRequestedSelectedSite ) {
			return;
		}

		const signupCompleteFlowName = getSignupCompleteFlowNameAndClear();
		const signupCompleteStepName = getSignupCompleteStepNameAndClear();
		const isReEnteringStep =
			signupCompleteFlowName === flow.name && signupCompleteStepName === currentStepRoute;
		if ( ! isReEnteringStep ) {
			recordStepStart( flow.name, kebabCase( currentStepRoute ), {
				intent,
				is_in_hosting_flow: isAnyHostingFlow( flow.name ),
				...( design && { assembler_source: getAssemblerSource( design ) } ),
			} );
		}

		// Also record page view for data and analytics
		const pathname = window.location.pathname || '';
		const pageTitle = `Setup > ${ flow.name } > ${ currentStepRoute }`;
		recordPageView( pathname, pageTitle );

		// We leave out intent from the dependency list, due to the ONBOARD_STORE being reset in the exit flow.
		// This causes the intent to become empty, and thus this event being fired again.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ flow.name, currentStepRoute, hasRequestedSelectedSite ] );

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
				return <></>;
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

	let progressBarExtraStyle: React.CSSProperties = {};
	if ( 'videopress' === flow.name ) {
		progressBarExtraStyle = {
			'--previous-progress': Math.min( 100, Math.ceil( previousProgressValue * 100 ) ) + '%',
			'--current-progress': Math.min( 100, Math.ceil( progressValue * 100 ) ) + '%',
		} as React.CSSProperties;
	}

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
								progressBarExtraStyle={ progressBarExtraStyle }
								progressValue={ progressValue }
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
