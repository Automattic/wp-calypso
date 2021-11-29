import { useSelect, useDispatch } from '@wordpress/data';
import * as React from 'react';
import { Redirect, Switch, Route, useLocation } from 'react-router-dom';
import { isE2ETest } from 'calypso/lib/e2e';
import useFseBetaOptInStep from '../hooks/use-fse-beta-opt-in-step';
import { usePrevious } from '../hooks/use-previous';
import {
	GutenLocationStateType,
	Step,
	StepType,
	useIsAnchorFm,
	useCurrentStep,
	usePath,
	useNewQueryParam,
	useAnchorFmParams,
	useStepRouteParam,
} from '../path';
import { STORE_KEY } from '../stores/onboard';
import { SITE_STORE } from '../stores/site';
import AcquireIntent from './acquire-intent';
import AnchorError from './anchor-error';
import CreateSite from './create-site';
import CreateSiteError from './create-site-error';
import Designs from './designs';
import Domains from './domains';
import Features from './features';
import FseBetaOptIn from './fse-beta-opt-in';
import { HeroFlowIntentGathering } from './hero-flow/intent-gathering';
import { HeroFlowSiteOptions } from './hero-flow/site-options';
import { HeroFlowStaringPoint } from './hero-flow/starting-point';
import { HeroFlowThemePicker } from './hero-flow/theme-picker';
import Language from './language';
import Plans from './plans';
import StylePreview from './style-preview';
import type { Attributes } from './types';
import type { BlockEditProps } from '@wordpress/blocks';

import './colors.scss';
import './style.scss';

const OnboardingEdit: React.FunctionComponent< BlockEditProps< Attributes > > = () => {
	const {
		hasSiteTitle,
		hasSelectedDesign,
		hasSelectedDesignWithoutFonts,
		isRedirecting,
		isEnrollingInFse,
	} = useSelect(
		( select ) => {
			const onboardSelect = select( STORE_KEY );

			return {
				hasSiteTitle: onboardSelect.hasSiteTitle(),
				hasSelectedDesign: onboardSelect.hasSelectedDesign(),
				hasSelectedDesignWithoutFonts: onboardSelect.hasSelectedDesignWithoutFonts(),
				isRedirecting: onboardSelect.getIsRedirecting(),
				isEnrollingInFse: onboardSelect.isEnrollingInFseBeta(),
			};
		},
		[ STORE_KEY ]
	);
	const { isCreatingSite, newSiteError } = useSelect(
		( select ) => {
			const { isFetchingSite, getNewSiteError } = select( SITE_STORE );

			return {
				isCreatingSite: isFetchingSite(),
				newSiteError: getNewSiteError(),
			};
		},
		[ SITE_STORE ]
	);
	const shouldTriggerCreate = useNewQueryParam();
	const isAnchorFmSignup = useIsAnchorFm();
	const { isAnchorFmPodcastIdError } = useAnchorFmParams();

	const makePath = usePath();
	const currentStep = useCurrentStep();
	const previousStep = usePrevious( currentStep );

	const { state: locationState = {} } = useLocation< GutenLocationStateType >();

	React.useLayoutEffect( () => {
		// Runs some navigation related side-effects when the step changes
		// We only want to run when a real transition happens:
		// - not on first load when `previousStep === undefined` and,
		// - during an intermediate state when `previousStep === currentStep`
		if ( previousStep && previousStep !== currentStep ) {
			setTimeout( () => window.scrollTo( 0, 0 ), 0 );

			if ( window.getSelection && window.getSelection()?.empty ) {
				window.getSelection()?.empty();
			}
		}
	}, [ currentStep, previousStep ] );

	// makePathWithState( path: StepType ) - A wrapper around makePath() that preserves location state.
	// This uses makePath() to generate a string path, then transforms that
	// string path into an object that also contains the location state.
	const makePathWithState = React.useCallback(
		( path: StepType ) => {
			return {
				pathname: makePath( path ),
				state: locationState,
			};
		},
		[ makePath, locationState ]
	);

	const canUseDesignStep = React.useCallback( (): boolean => {
		return hasSiteTitle;
	}, [ hasSiteTitle ] );

	const canUseStyleStep = React.useCallback( (): boolean => {
		return hasSelectedDesign;
	}, [ hasSelectedDesign ] );

	const shouldSkipStyleStep = React.useCallback( (): boolean => {
		return hasSelectedDesignWithoutFonts || isEnrollingInFse;
	}, [ hasSelectedDesignWithoutFonts, isEnrollingInFse ] );

	const canUseFeatureStep = React.useCallback( (): boolean => {
		return hasSelectedDesign;
	}, [ hasSelectedDesign ] );

	const canUsePlanStep = React.useCallback( (): boolean => {
		return hasSelectedDesign;
	}, [ hasSelectedDesign ] );

	const canUseCreateSiteStep = React.useCallback( (): boolean => {
		return isCreatingSite || isRedirecting;
	}, [ isCreatingSite, isRedirecting ] );

	const canUseFseBetaOptInStep = useFseBetaOptInStep();

	const getLatestStepPath = () => {
		if ( hasSelectedDesign && ! isAnchorFmSignup ) {
			return makePathWithState( Step.Plans );
		}

		if ( canUseDesignStep() ) {
			return makePathWithState( Step.DesignSelection );
		}

		return makePathWithState( Step.IntentGathering );
	};

	const getDesignWithoutFontsPath = () => {
		// This is the path the is used to redirect the user when a design
		// with no 'fonts' is selected
		if ( hasSiteTitle ) {
			return makePathWithState( Step.Features );
		}
		return makePathWithState( Step.Domains );
	};

	const redirectToLatestStep = <Redirect to={ getLatestStepPath() } />;
	const redirectToDesignWithoutFontsStep = <Redirect to={ getDesignWithoutFontsPath() } />;

	function createSiteOrError() {
		if ( newSiteError ) {
			// Temporarily capture error related to new site creation to E2E
			if ( isE2ETest() ) {
				throw new Error( `onboarding-debug ${ JSON.stringify( newSiteError ) }` );
			}

			return <CreateSiteError linkTo={ getLatestStepPath() } />;
		} else if ( canUseCreateSiteStep() ) {
			return <CreateSite />;
		}

		return redirectToLatestStep;
	}

	// Remember the last accessed route path
	const location = useLocation();
	const step = useStepRouteParam();
	const { setLastLocation } = useDispatch( STORE_KEY );

	React.useEffect( () => {
		const modalSteps: StepType[] = [ Step.DomainsModal, Step.PlansModal, Step.LanguageModal ];
		if (
			// When location.key is undefined, this means user has just entered gutenboarding from url.
			location.key !== undefined &&
			// When step exists, and step is not any from the modals
			step &&
			! modalSteps.includes( step )
		) {
			// Remember last location
			setLastLocation( location.pathname );
		}
	}, [ location, step, setLastLocation ] );

	const styleStepIfNotSkipped = shouldSkipStyleStep() ? (
		redirectToDesignWithoutFontsStep
	) : (
		<StylePreview />
	);

	function initialStep() {
		// In the FSE Beta flow, the opt-in screen becomes the first step.
		if ( canUseFseBetaOptInStep ) {
			return <Redirect to={ Step.FseBetaOptIn } />;
		}
		if ( isAnchorFmPodcastIdError ) {
			return <AnchorError />;
		}
		return <AcquireIntent />;
	}

	return (
		<div className="onboarding-block">
			{ isCreatingSite && (
				<Redirect
					push={ shouldTriggerCreate ? undefined : true }
					to={ makePathWithState( Step.CreateSite ) }
				/>
			) }
			<Switch>
				<Route exact path={ makePath( Step.IntentGathering ) }>
					{ initialStep() }
				</Route>

				<Route path={ makePath( Step.FseBetaOptIn ) }>
					<FseBetaOptIn />
				</Route>

				{ canUseFseBetaOptInStep && (
					<Route path={ makePath( Step.FseBetaIntentGathering ) }>
						<AcquireIntent />
					</Route>
				) }

				<Route path={ makePath( Step.DesignSelection ) }>
					<Designs />
				</Route>

				<Route path={ makePath( Step.Style ) }>
					{ canUseStyleStep() ? styleStepIfNotSkipped : redirectToLatestStep }
				</Route>

				<Route path={ makePath( Step.Features ) }>
					{ canUseFeatureStep() ? <Features /> : redirectToLatestStep }
				</Route>

				<Route path={ makePath( Step.Domains ) }>
					<Domains />
				</Route>

				<Route path={ makePath( Step.DomainsModal ) }>
					<Domains isModal />
				</Route>

				<Route path={ makePath( Step.Plans ) }>
					{ canUsePlanStep() ? <Plans /> : redirectToLatestStep }
				</Route>

				<Route path={ makePath( Step.PlansModal ) }>
					<Plans isModal />
				</Route>

				<Route path={ makePath( Step.LanguageModal ) }>
					<Language previousStep={ previousStep } />
				</Route>

				<Route path={ makePath( Step.CreateSite ) }>{ createSiteOrError() }</Route>

				<Route path={ makePath( Step.HeroIntentGathering ) }>
					<HeroFlowIntentGathering />
				</Route>

				<Route path={ makePath( Step.HeroThemeSelection ) }>
					<HeroFlowThemePicker />
				</Route>

				<Route path={ makePath( Step.HeroSiteOptions ) }>
					<HeroFlowSiteOptions />
				</Route>

				<Route path={ makePath( Step.HeroStartingPoint ) }>
					<HeroFlowStaringPoint />
				</Route>
			</Switch>
		</div>
	);
};

export default OnboardingEdit;
