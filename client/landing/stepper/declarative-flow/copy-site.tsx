import { useFlowProgress, COPY_SITE_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordFullStoryEvent } from 'calypso/lib/analytics/fullstory';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import AutomatedCopySite from './internals/steps-repository/automated-copy-site';
import Intro from './internals/steps-repository/intro';
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
			{ slug: 'site-creation-step', component: SiteCreationStep },
			{ slug: 'processing', component: ProcessingStep },
			{ slug: 'automated-copy', component: AutomatedCopySite },
			{ slug: 'processing-copy', component: ProcessingStep },
		];
	},

	useStepNavigation( _currentStepSlug, navigate ) {
		const flowName = this.name;
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStepSlug, flowName } );
		const urlQueryParams = useQuery();

		const { setPlanCartItem } = useDispatch( ONBOARD_STORE );
		const { getPlanCartItem } = useSelect( ( select ) => select( ONBOARD_STORE ) );

		setStepProgress( flowProgress );

		const submit = async (
			providedDependencies: ProvidedDependencies = {},
			...params: string[]
		) => {
			// We need to do this here to avoid any race conditions
			// due to dispatch and window.assign
			const productSlug = urlQueryParams.get( 'productSlug' );
			if ( productSlug && ! getPlanCartItem() ) {
				const productToAdd = {
					product_slug: productSlug,
				};
				setPlanCartItem( productToAdd );
			}

			recordSubmitStep( providedDependencies, '', flowName, _currentStepSlug );

			switch ( _currentStepSlug ) {
				case 'intro': {
					clearSignupDestinationCookie();
					return navigate( 'site-creation-step' );
				}

				case 'site-creation-step': {
					return navigate( 'processing' );
				}

				case 'processing': {
					const destination = addQueryArgs( `/setup/${ this.name }/automated-copy`, {
						sourceSlug: urlQueryParams.get( 'sourceSlug' ),
						siteSlug: providedDependencies?.siteSlug,
					} );
					persistSignupDestination( destination );
					setSignupCompleteSlug( providedDependencies?.siteSlug );
					setSignupCompleteFlowName( flowName );
					const returnUrl = encodeURIComponent( destination );
					return window.location.assign(
						`/checkout/${ encodeURIComponent(
							( providedDependencies?.siteSlug as string ) ?? ''
						) }?redirect_to=${ returnUrl }&signup=1`
					);
				}

				case 'automated-copy': {
					return navigate( 'processing-copy' );
				}

				case 'processing-copy': {
					const processingResult = params[ 0 ] as ProcessingResult;

					if ( processingResult === ProcessingResult.FAILURE ) {
						// Create a retry step here.
						return navigate( 'retry' );
					}
					clearSignupDestinationCookie();
					return window.location.assign( `/home/${ providedDependencies?.siteSlug }` );
				}
			}
			return providedDependencies;
		};

		const goBack = () => {
			return;
		};

		const goNext = () => {
			return;
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default copySite;
