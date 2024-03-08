import { useLocale } from '@automattic/i18n-utils';
import { useEffect } from '@wordpress/element';
import { translate } from 'i18n-calypso';
import { getLocaleFromPathname } from 'calypso/boot/locale';
import { recordSubmitStep } from 'calypso/landing/stepper/declarative-flow/internals/analytics/record-submit-step';
import { redirect } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/util';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useDomainParams } from 'calypso/landing/stepper/hooks/use-domain-params';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { useLoginUrl } from '../utils/path';
import DomainContactInfo from './internals/steps-repository/domain-contact-info';

const domainUserTransfer: Flow = {
	name: 'domain-user-transfer',
	isSignupFlow: false,
	useSteps() {
		return [ { slug: 'domain-contact-info', component: DomainContactInfo } ];
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, '', flowName, currentStep );
			switch ( currentStep ) {
				case 'domain-contact-info':
					return window.location.assign(
						`/checkout/domain-transfer-to-any-user/thank-you/${ providedDependencies.domain }`
					);
			}
			return providedDependencies;
		}

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

	useAssertConditions(): AssertConditionResult {
		const flowName = this.name;
		const isLoggedIn = useSelector( isUserLoggedIn );

		// There is a race condition where useLocale is reporting english,
		// despite there being a locale in the URL so we need to look it up manually.
		const useLocaleSlug = useLocale();
		const pathLocaleSlug = getLocaleFromPathname();
		const locale = pathLocaleSlug || useLocaleSlug;

		const { domain } = useDomainParams();

		const logInUrl = useLoginUrl( {
			variationName: flowName,
			redirectTo: `/setup/${ flowName }?domain=${ domain }`,
			pageTitle: translate( 'Receive domain' ),
			locale,
		} );

		useEffect( () => {
			if ( ! isLoggedIn ) {
				redirect( logInUrl );
			}
		}, [] );

		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( ! isLoggedIn ) {
			result = {
				state: AssertConditionState.CHECKING,
				message: `${ flowName } requires a logged in user`,
			};
		}

		return result;
	},
};

export default domainUserTransfer;
