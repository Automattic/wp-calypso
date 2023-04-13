import { useLocale } from '@automattic/i18n-utils';
import { START_WRITING_FLOW } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import Processing from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/processing-step';
import QuickSite from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/quick-site';
import { USER_STORE } from '../stores';
import { redirect } from './internals/steps-repository/import/util';
import { AssertConditionResult, AssertConditionState, Flow } from './internals/types';
import type { UserSelect } from '@automattic/data-stores';

const startWriting: Flow = {
	name: START_WRITING_FLOW,
	useSteps() {
		return [
			{ slug: 'quick-site', component: QuickSite },
			{ slug: 'processing', component: Processing },
		];
	},

	useStepNavigation() {
		// const submit = () => {
		// 	switch ( currentStep ) {
		// 		case 'quick-site':
		// 			return navigate( 'processing' );
		// 	}
		// };
		return {};
	},

	useAssertConditions(): AssertConditionResult {
		const flowName = this.name;
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const locale = useLocale();

		const logInUrl =
			locale && locale !== 'en'
				? `/start/account/user/${ locale }?variationName=${ flowName }&pageTitle=Start%20writing&redirect_to=/setup/${ flowName }/quick-site`
				: `/start/account/user?variationName=${ flowName }&pageTitle=Start%20writing&redirect_to=/setup/${ flowName }/quick-site`;

		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( ! userIsLoggedIn ) {
			redirect( logInUrl );
			result = {
				state: AssertConditionState.CHECKING,
				message: 'writing requires a logged in user',
			};
		}

		return result;
	},
};

export default startWriting;
