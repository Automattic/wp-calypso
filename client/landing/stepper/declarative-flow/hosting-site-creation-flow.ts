import { HOSTING_SITE_CREATION_FLOW } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import type { Flow, ProvidedDependencies } from './internals/types';
import './internals/hosting-site-creation-flow.scss';

const hosting: Flow = {
	name: HOSTING_SITE_CREATION_FLOW,
	useSteps() {
		return [
			{ slug: 'plans', asyncComponent: () => import( './internals/steps-repository/plans' ) },
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
				case 'plans':
					return navigate( 'siteCreationStep' );

				case 'siteCreationStep':
					return navigate( 'processing' );

				case 'processing': {
					const destination = addQueryArgs( '/sites', {
						'new-site': providedDependencies.siteSlug,
					} );
					persistSignupDestination( destination );
					setSignupCompleteSlug( providedDependencies?.siteSlug );
					setSignupCompleteFlowName( flowName );

					return window.location.assign(
						addQueryArgs(
							`/checkout/${ encodeURIComponent(
								( providedDependencies?.siteSlug as string ) ?? ''
							) }`,
							{ redirect_to: destination }
						)
					);
				}
			}
			return providedDependencies;
		};

		return { submit };
	},
};

export default hosting;
