import { useFlowProgress, COPY_SITE_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { recordFullStoryEvent } from 'calypso/lib/analytics/fullstory';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import Intro from './internals/steps-repository/intro';
import LaunchPad from './internals/steps-repository/launchpad';
import ProcessingStep, { ProcessingResult } from './internals/steps-repository/processing-step';
import SiteCreationStep from './internals/steps-repository/site-creation-step';
import type { Flow, ProvidedDependencies } from './internals/types';

const copySite: Flow = {
	name: COPY_SITE_FLOW,
	get title() {
		return translate( 'Copy Site' );
	},
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
			recordFullStoryEvent( 'calypso_signup_start_copy_site', { flow: this.name } );
		}, [] );

		return [
			{ slug: 'intro', component: Intro },
			// { slug: 'chooseAPlan', component: ChooseAPlan }, // We can replicate the chooseAPlan.onPlanSelect
			{ slug: 'siteCreationStep', component: SiteCreationStep },
			{ slug: 'processing', component: ProcessingStep },
			{ slug: 'launchpad', component: LaunchPad },
		];
	},

	useStepNavigation( _currentStepSlug, navigate ) {
		const flowName = this.name;
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStepSlug, flowName } );
		const siteSlug = useSiteSlug();

		setStepProgress( flowProgress );

		const submit = ( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) => {
			recordSubmitStep( providedDependencies, '', flowName, _currentStepSlug );

			switch ( _currentStepSlug ) {
				case 'intro': {
					return navigate( 'siteCreationStep' );
				}

				case 'siteCreationStep': {
					return navigate( 'processing' );
				}

				case 'processing': {
					const processingResult = params[ 0 ] as ProcessingResult;

					if ( processingResult === ProcessingResult.FAILURE ) {
						return navigate( 'error' );
					}

					const returnUrl = '/home/' + providedDependencies?.siteSlug;

					return window.location.assign(
						`/checkout/${ encodeURIComponent(
							( providedDependencies?.siteSlug as string ) ?? ''
						) }?redirect_to=${ returnUrl }&signup=1`
					);
				}
			}
			return providedDependencies;
		};

		const goBack = () => {
			return;
		};

		const goNext = () => {
			switch ( _currentStepSlug ) {
				case 'launchpad':
					return window.location.assign( `/view/${ siteSlug }` );

				default:
					return navigate( 'intro' );
			}
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default copySite;
