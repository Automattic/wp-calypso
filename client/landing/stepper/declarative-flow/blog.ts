import { useLocale } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import { redirect } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/util';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSelector } from 'calypso/state';
import { getCurrentUserSiteCount, isUserLoggedIn } from 'calypso/state/current-user/selectors';

const Blog: Flow = {
	name: 'blog',
	get title() {
		return translate( 'Blog' );
	},
	useSteps() {
		return [
			{
				slug: 'blogger-intent',
				asyncComponent: () => import( './internals/steps-repository/blogger-intent' ),
			},
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		const goBack = () => {
			return;
		};

		const goNext = () => {
			return;
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep };
	},

	useAssertConditions(): AssertConditionResult {
		const flowName = this.name;
		const isLoggedIn = useSelector( isUserLoggedIn );
		const currentUserSiteCount = useSelector( getCurrentUserSiteCount );
		const locale = useLocale();
		const userAlreadyHasSites = currentUserSiteCount && currentUserSiteCount > 0;

		const logInUrl =
			locale && locale !== 'en'
				? `/start/account/user/${ locale }?redirect_to=/setup/blog`
				: `/start/account/user?redirect_to=/setup/blog`;

		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( ! isLoggedIn ) {
			redirect( logInUrl );
			result = {
				state: AssertConditionState.CHECKING,
				message: `${ flowName } requires a logged in user`,
			};
		} else if ( userAlreadyHasSites ) {
			// This prevents a bunch of sites being created accidentally.
			redirect( `/` );
			result = {
				state: AssertConditionState.CHECKING,
				message: `${ flowName } requires no preexisting sites`,
			};
		}

		return result;
	},
};

export default Blog;
