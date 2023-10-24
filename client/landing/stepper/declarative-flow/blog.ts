import { useLocale } from '@automattic/i18n-utils';
import { useEffect } from '@wordpress/element';
import { translate } from 'i18n-calypso';
import { getLocaleFromQueryParam, getLocaleFromPathname } from 'calypso/boot/locale';
import { redirect } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/util';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { useLoginUrl } from '../utils/path';

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

	useStepNavigation() {
		return {};
	},

	useAssertConditions(): AssertConditionResult {
		const flowName = this.name;
		const isLoggedIn = useSelector( isUserLoggedIn );

		// There is a race condition where useLocale is reporting english,
		// despite there being a locale in the URL so we need to look it up manually.
		// We also need to support both query param and path suffix localized urls
		// depending on where the user is coming from.
		const useLocaleSlug = useLocale();
		// Query param support can be removed after dotcom-forge/issues/2960 and 2961 are closed.
		const queryLocaleSlug = getLocaleFromQueryParam();
		const pathLocaleSlug = getLocaleFromPathname();
		const locale = queryLocaleSlug || pathLocaleSlug || useLocaleSlug;

		const logInUrl = useLoginUrl( {
			variationName: 'blogger-intent',
			redirectTo: `/setup/blog`,
			locale,
		} );

		// Despite sending a CHECKING state, this function gets called again with the
		// /setup/blog/blogger-intent route which has no locale in the path so we need to
		// redirect off of the first render.
		// This effects both /setup/blog/<locale> starting points and /setup/blog/blogger-intent/<locale> urls.
		// The double call also hapens on urls without locale.
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

export default Blog;
