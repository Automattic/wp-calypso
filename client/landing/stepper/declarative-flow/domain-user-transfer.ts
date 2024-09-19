import { useEffect } from '@wordpress/element';
import { translate } from 'i18n-calypso';
import { redirect } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/util';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useDomainParams } from 'calypso/landing/stepper/hooks/use-domain-params';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
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
		function submit( providedDependencies: ProvidedDependencies = {} ) {
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

		const locale = useFlowLocale();

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
