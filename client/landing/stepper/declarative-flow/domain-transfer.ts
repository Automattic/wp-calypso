import { DOMAIN_TRANSFER } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import { STEPS } from './internals/steps';
import { FlowV2 } from './internals/types';

const domainTransfer: FlowV2 = {
	name: DOMAIN_TRANSFER,
	get title() {
		return translate( 'Bulk domain transfer' );
	},
	isSignupFlow: false,
	initialize() {
		return [
			STEPS.DOMAIN_TRANSFER_INTRO,
			...stepsWithRequiredLogin( [ STEPS.DOMAIN_TRANSFER_DOMAINS, STEPS.PROCESSING ] ),
		];
	},

	useStepNavigation( currentStepSlug, navigate ) {
		const flowName = this.name;

		const submit: ReturnType< FlowV2[ 'useStepNavigation' ] >[ 'submit' ] = (
			providedDependencies = {}
		) => {
			switch ( currentStepSlug ) {
				case 'intro':
					clearSignupDestinationCookie();

					return navigate( 'domains' );
				case 'domains': {
					// go to processing step without pushing it to history
					// so the back button would go back to domains step
					// Why the explicit undefined?
					// If we want to replace, should that be using the third
					// `replace` argument/
					return navigate( 'processing', undefined );
				}
				case 'processing': {
					setSignupCompleteSlug( providedDependencies.siteSlug );
					setSignupCompleteFlowName( flowName );

					const checkoutBackURL = new URL(
						typeof this.variantSlug !== 'undefined'
							? `/setup/${ this.variantSlug }/domains`
							: '/setup/domain-transfer/domains',
						window.location.href
					);

					// use replace instead of assign to remove the processing URL from history
					return window.location.replace(
						`/checkout/no-site?signup=0&isDomainOnly=1&checkoutBackUrl=${ encodeURIComponent(
							checkoutBackURL.href
						) }`
					);
				}
				default:
					return;
			}
		};

		const goBack = () => {
			switch ( currentStepSlug ) {
				case 'domains':
					return navigate( 'intro' );
				default:
					return;
			}
		};

		return { goBack, submit };
	},
};

export default domainTransfer;
