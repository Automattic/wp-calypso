import { useLocale } from '@automattic/i18n-utils';
import { START_WRITING_FLOW } from '@automattic/onboarding';
import { useSelector } from 'react-redux';
import { recordSubmitStep } from 'calypso/landing/stepper/declarative-flow/internals/analytics/record-submit-step';
import QuickSite from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/quick-site';
import { getCurrentUserSiteCount, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { redirect } from './internals/steps-repository/import/util';
import ProcessingStep from './internals/steps-repository/processing-step';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from './internals/types';

const startWriting: Flow = {
	name: START_WRITING_FLOW,
	useSteps() {
		return [
			{ slug: 'quick-site', component: QuickSite },
			{ slug: 'processing', component: ProcessingStep },
		];
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, '', flowName, currentStep );
			switch ( currentStep ) {
				case 'quick-site':
					return navigate( 'processing' );
				case 'processing': {
					if ( providedDependencies?.siteSlug ) {
						return redirect( `https://${ providedDependencies?.siteSlug }/wp-admin/post-new.php` );
					}
				}
			}
		}
		return { submit };
	},

	useAssertConditions(): AssertConditionResult {
		const flowName = this.name;
		const isLoggedIn = useSelector( isUserLoggedIn );
		const currentUserSiteCount = useSelector( getCurrentUserSiteCount );
		const locale = useLocale();

		const logInUrl =
			locale && locale !== 'en'
				? `/start/account/user/${ locale }?variationName=${ flowName }&pageTitle=Start%20writing&redirect_to=/setup/${ flowName }/quick-site`
				: `/start/account/user?variationName=${ flowName }&pageTitle=Start%20writing&redirect_to=/setup/${ flowName }/quick-site`;

		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( ! isLoggedIn ) {
			redirect( logInUrl );
			result = {
				state: AssertConditionState.CHECKING,
				message: `${ flowName } requires a logged in user`,
			};
		} else if ( currentUserSiteCount && currentUserSiteCount > 0 ) {
			redirect( '/post?showLaunchpad=true' );
			result = {
				state: AssertConditionState.CHECKING,
				message: `${ flowName } requires no preexisting sites`,
			};
		}

		return result;
	},
};

export default startWriting;
