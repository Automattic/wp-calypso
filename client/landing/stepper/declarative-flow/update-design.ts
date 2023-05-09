import { translate } from 'i18n-calypso';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useQuery } from '../hooks/use-query';
import { useSiteSlug } from '../hooks/use-site-slug';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import DesignSetup from './internals/steps-repository/design-setup';
import Processing from './internals/steps-repository/processing-step';
import { ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';

const updateDesign: Flow = {
	name: 'update-design',
	get title() {
		return translate( 'Choose Design' );
	},
	useSteps() {
		return [
			{ slug: 'designSetup', component: DesignSetup },
			{ slug: 'processing', component: Processing },
		];
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const siteSlug = useSiteSlug();
		const flowToReturnTo = useQuery().get( 'flowToReturnTo' ) || 'free';

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, 'update-design', flowName, currentStep );
			switch ( currentStep ) {
				case 'processing':
					return window.location.assign(
						`/setup/${ flowToReturnTo }/launchpad?siteSlug=${ siteSlug }`
					);

				case 'designSetup':
					if ( providedDependencies?.goToCheckout ) {
						const destination = `/setup/${ flowToReturnTo }/launchpad?siteSlug=${ providedDependencies.siteSlug }`;
						persistSignupDestination( destination );
						setSignupCompleteSlug( providedDependencies?.siteSlug );
						setSignupCompleteFlowName( flowToReturnTo );
						const returnUrl = encodeURIComponent(
							`/setup/${ flowToReturnTo }/launchpad?siteSlug=${ providedDependencies?.siteSlug }`
						);

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								( providedDependencies?.siteSlug as string ) ?? ''
							) }?redirect_to=${ returnUrl }&signup=1`
						);
					}
					return navigate( `processing?siteSlug=${ siteSlug }&flowToReturnTo=${ flowToReturnTo }` );
			}
		}

		return { submit };
	},
};

export default updateDesign;
