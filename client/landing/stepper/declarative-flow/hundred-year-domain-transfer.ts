import { HUNDRED_YEAR_DOMAIN_TRANSFER } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import { setSignupCompleteFlowName, setSignupCompleteSlug } from 'calypso/signup/storageUtils';
import domainTransfer from './domain-transfer';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from './internals/types';

const hundredYearDomainTransfer: Flow = {
	...domainTransfer,
	variantSlug: HUNDRED_YEAR_DOMAIN_TRANSFER,
	get title() {
		return translate( '100-Year Domain' );
	},

	// Always start on the "domains" step, as we don't need what comes before it for the 100-year domain transfer flow.
	// It doesn't make sense to show it as it contains additional cluttering information that doesn't matter
	// specifically under the 100-year domain context - they'll also come from a different entry point.
	useSteps() {
		const transferSteps = domainTransfer.useSteps();
		const domainsStepIndex = transferSteps.findIndex( ( step ) => step.slug === 'domains' );
		return [
			transferSteps[ domainsStepIndex ],
			...stepsWithRequiredLogin( transferSteps.slice( domainsStepIndex ) ),
		];
	},

	// Always allow the user to proceed with the transfer, as we assert that the user is logged in later.
	useAssertConditions(): AssertConditionResult {
		return { state: AssertConditionState.SUCCESS };
	},

	useStepNavigation( _currentStepSlug, navigate ) {
		const flowName = this.name;

		const submit = async ( providedDependencies: ProvidedDependencies = {} ) => {
			switch ( _currentStepSlug ) {
				case 'domains': {
					// go to processing step without pushing it to history
					// so the back button would go back to domains step
					return navigate( 'processing', undefined );
				}
				case 'processing': {
					setSignupCompleteSlug( providedDependencies?.siteSlug );
					setSignupCompleteFlowName( flowName );

					// Delay to keep the "Setting up your legacy..." page showing for 2 seconds
					// since there's nothing to actually process in that step
					await new Promise( ( resolve ) => setTimeout( resolve, 2000 ) );

					const checkoutBackURL = new URL(
						'/setup/hundred-year-domain-transfer',
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

		return { submit };
	},
};

export default hundredYearDomainTransfer;
