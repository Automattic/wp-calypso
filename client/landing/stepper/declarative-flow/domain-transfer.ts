import { DOMAIN_TRANSFER } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import { STEPS } from './internals/steps';
import { ProvidedDependencies, FlowV1 } from './internals/types';

const DOMAIN_TRANSFER_STEPS = [
	STEPS.DOMAIN_TRANSFER_INTRO,
	...stepsWithRequiredLogin( [ STEPS.DOMAIN_TRANSFER_DOMAINS, STEPS.PROCESSING ] ),
];

const domainTransfer: FlowV1 = {
	name: DOMAIN_TRANSFER,
	get title() {
		return translate( 'Bulk domain transfer' );
	},
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: false,
	useSteps() {
		return DOMAIN_TRANSFER_STEPS;
	},

	useStepNavigation( _currentStepSlug, navigate ) {
		const flowName = this.name;
		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			switch ( _currentStepSlug ) {
				case 'intro':
					clearSignupDestinationCookie();
					return navigate( 'domains' );
				case 'domains': {
					return navigate( 'processing', undefined );
				}
				case 'processing': {
					setSignupCompleteSlug( providedDependencies?.siteSlug );
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
			switch ( _currentStepSlug ) {
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
