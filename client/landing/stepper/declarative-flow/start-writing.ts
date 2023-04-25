import { useLocale } from '@automattic/i18n-utils';
import { START_WRITING_FLOW } from '@automattic/onboarding';
import { useSelector } from 'react-redux';
import { updateLaunchpadSettings } from 'calypso/data/sites/use-launchpad';
import { recordSubmitStep } from 'calypso/landing/stepper/declarative-flow/internals/analytics/record-submit-step';
import { redirect } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/util';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import { getCurrentUserSiteCount, isUserLoggedIn } from 'calypso/state/current-user/selectors';

const startWriting: Flow = {
	name: START_WRITING_FLOW,
	useSteps() {
		return [
			{
				slug: 'site-creation-step',
				asyncComponent: () => import( './internals/steps-repository/site-creation-step' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
		];
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, '', flowName, currentStep );
			switch ( currentStep ) {
				case 'site-creation-step':
					return navigate( 'processing' );
				case 'processing': {
					if ( providedDependencies?.siteSlug ) {
						await updateLaunchpadSettings( String( providedDependencies?.siteSlug ), {
							checklist_statuses: { first_post_published: true },
						} );

						const siteOrigin = window.location.origin;

						return redirect(
							`https://${ providedDependencies?.siteSlug }/wp-admin/post-new.php?${ START_WRITING_FLOW }=true&origin=${ siteOrigin }`
						);
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
				? `/start/account/user/${ locale }?variationName=${ flowName }&pageTitle=Start%20writing&redirect_to=/setup/${ flowName }`
				: `/start/account/user?variationName=${ flowName }&pageTitle=Start%20writing&redirect_to=/setup/${ flowName }`;

		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( ! isLoggedIn ) {
			redirect( logInUrl );
			result = {
				state: AssertConditionState.CHECKING,
				message: `${ flowName } requires a logged in user`,
			};
		} else if ( currentUserSiteCount && currentUserSiteCount > 0 ) {
			redirect( `/post?${ START_WRITING_FLOW }=true` );
			result = {
				state: AssertConditionState.CHECKING,
				message: `${ flowName } requires no preexisting sites`,
			};
		}

		return result;
	},
};

export default startWriting;
