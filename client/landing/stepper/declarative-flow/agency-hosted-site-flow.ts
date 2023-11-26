import { AGENCY_HOSTED_SITE_FLOW, AGENCY_OFFER_BUNDLE } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { Flow, ProvidedDependencies } from './internals/types';

const hosting: Flow = {
	name: AGENCY_HOSTED_SITE_FLOW,
	useSteps() {
		return [
			{
				slug: 'siteCreationStep',
				asyncComponent: () => import( './internals/steps-repository/site-creation-step' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
		];
	},
	useStepNavigation( _currentStepSlug, navigate ) {
		const flowName = this.name;

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			recordSubmitStep( providedDependencies, '', flowName, _currentStepSlug );

			switch ( _currentStepSlug ) {
				case 'siteCreationStep':
					return navigate( 'processing' );

				case 'processing': {
					// Purchasing Business or Commerce plans will trigger an atomic transfer, so go to stepper flow where we wait for it to complete.
					const destination = addQueryArgs( '/setup/transferring-hosted-site', {
						siteId: providedDependencies.siteId,
					} );

					persistSignupDestination( destination );
					setSignupCompleteSlug( providedDependencies?.siteSlug );
					setSignupCompleteFlowName( flowName );

					if ( providedDependencies.goToCheckout ) {
						return window.location.assign(
							addQueryArgs(
								`/checkout/${ encodeURIComponent(
									( providedDependencies?.siteSlug as string ) ?? ''
								) }`,
								{ redirect_to: destination }
							)
						);
					}

					return window.location.assign( destination );
				}
			}
		};

		return {
			submit,
		};
	},
	useSideEffect( currentStepSlug ) {
		const { setProductCartItems } = useDispatch( ONBOARD_STORE );

		useEffect(
			() => {
				if ( currentStepSlug === undefined ) {
					setProductCartItems( AGENCY_OFFER_BUNDLE );
				}
			},
			// We only need to reset the store when the flow is mounted.
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[]
		);
	},
};

export default hosting;
