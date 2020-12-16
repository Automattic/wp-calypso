/**
 * External dependencies
 */
import * as React from 'react';
import { Redirect, Switch, Route, useLocation } from 'react-router-dom';
import { useSelect } from '@wordpress/data';
import type { BlockEditProps } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../stores/onboard';
import { SITE_STORE } from '../stores/site';
import { GutenLocationStateType, Step, StepType, useIsAnchorFm, useCurrentStep, usePath, useNewQueryParam } from '../path';
import { usePrevious } from '../hooks/use-previous';
import DesignSelector from './design-selector';
import CreateSite from './create-site';
import CreateSiteError from './create-site-error';
import AcquireIntent from './acquire-intent';
import StylePreview from './style-preview';
import Features from './features';
import Plans from './plans';
import Domains from './domains';
import Language from './language';

import type { Attributes } from './types';

import './colors.scss';
import './style.scss';

const OnboardingEdit: React.FunctionComponent< BlockEditProps< Attributes > > = () => {
	const { selectedDesign, siteTitle } = useSelect( ( select ) => select( STORE_KEY ).getState() );
	const isRedirecting = useSelect( ( select ) => select( STORE_KEY ).getIsRedirecting() );
	const isCreatingSite = useSelect( ( select ) => select( SITE_STORE ).isFetchingSite() );
	const newSiteError = useSelect( ( select ) => select( SITE_STORE ).getNewSiteError() );
	const shouldTriggerCreate = useNewQueryParam();
	const isAnchorFmSignup = useIsAnchorFm();

	const makePath = usePath();
	const currentStep = useCurrentStep();
	const previousStep = usePrevious( currentStep );

	const { pathname, state: locationState = {} } = useLocation< GutenLocationStateType >();

	React.useEffect( () => {
		setTimeout( () => window.scrollTo( 0, 0 ), 0 );
	}, [ pathname ] );

	// makePathState( path: StepType ) - A wrapper around makePath() that preserves location state.
	// This uses makePath() to generate a string path, then transforms that
	// string path into an object that also contains the location state.
	const makePathState = React.useCallback(
		( path: StepType ) => {
			return {
				pathname: makePath( path ),
				state: locationState,
			};
		},
		[ locationState ]
	);

	const canUseDesignStep = React.useCallback( (): boolean => {
		return !! siteTitle;
	}, [ siteTitle ] );

	const canUseStyleStep = React.useCallback( (): boolean => {
		return !! selectedDesign;
	}, [ selectedDesign ] );

	const canUseCreateSiteStep = React.useCallback( (): boolean => {
		return isCreatingSite || isRedirecting;
	}, [ isCreatingSite, isRedirecting ] );

	const getLatestStepPath = () => {
		if ( canUseStyleStep() && ! isAnchorFmSignup ) {
			return makePathState( Step.Plans );
		}

		if ( canUseDesignStep() ) {
			return makePathState( Step.DesignSelection );
		}

		return makePathState( Step.IntentGathering );
	};

	const redirectToLatestStep = <Redirect to={ getLatestStepPath() } />;

	function createSiteOrError() {
		if ( newSiteError ) {
			return <CreateSiteError linkTo={ getLatestStepPath() } />;
		} else if ( canUseCreateSiteStep() ) {
			return <CreateSite />;
		}

		return redirectToLatestStep;
	}

	return (
		<div className="onboarding-block">
			{ isCreatingSite && (
				<Redirect
					push={ shouldTriggerCreate ? undefined : true }
					to={ makePathState( Step.CreateSite ) }
				/>
			) }
			<Switch>
				<Route exact path={ makePath( Step.IntentGathering ) }>
					<AcquireIntent />
				</Route>

				<Route path={ makePath( Step.DesignSelection ) }>
					<DesignSelector />
				</Route>

				<Route path={ makePath( Step.Style ) }>
					{ canUseStyleStep() ? <StylePreview /> : redirectToLatestStep }
				</Route>

				<Route path={ makePath( Step.Features ) }>
					{ canUseStyleStep() ? <Features /> : redirectToLatestStep }
				</Route>

				<Route path={ makePath( Step.Domains ) }>
					<Domains />
				</Route>

				<Route path={ makePath( Step.DomainsModal ) }>
					<Domains isModal />
				</Route>

				<Route path={ makePath( Step.Plans ) }>
					{ canUseStyleStep() ? <Plans /> : redirectToLatestStep }
				</Route>

				<Route path={ makePath( Step.PlansModal ) }>
					<Plans isModal />
				</Route>

				<Route path={ makePath( Step.LanguageModal ) }>
					<Language previousStep={ previousStep } />
				</Route>

				<Route path={ makePath( Step.CreateSite ) }>{ createSiteOrError() }</Route>
			</Switch>
		</div>
	);
};

export default OnboardingEdit;
