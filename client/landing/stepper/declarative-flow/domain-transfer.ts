import { DOMAIN_TRANSFER } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { USER_STORE } from '../stores';
import { useLoginUrl } from '../utils/path';
import {
	Flow,
	ProvidedDependencies,
	AssertConditionResult,
	AssertConditionState,
} from './internals/types';
import type { UserSelect } from '@automattic/data-stores';

const domainTransfer: Flow = {
	name: DOMAIN_TRANSFER,
	get title() {
		return translate( 'Bulk domain transfer' );
	},
	isSignupFlow: false,
	useSteps() {
		return [
			{
				slug: 'intro',
				asyncComponent: () => import( './internals/steps-repository/domain-transfer-intro' ),
			},
			{
				slug: 'domains',
				asyncComponent: () => import( './internals/steps-repository/domain-transfer-domains' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
		];
	},

	useAssertConditions( navigate ): AssertConditionResult {
		const isLoggedIn = useSelector( isUserLoggedIn );

		useEffect( () => {
			if ( ! isLoggedIn && navigate ) {
				navigate( 'intro' );
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [ isLoggedIn ] );

		return { state: AssertConditionState.SUCCESS };
	},

	useStepNavigation( _currentStepSlug, navigate ) {
		const flowName = this.name;
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		const logInUrl = useLoginUrl( {
			variationName: flowName,
			redirectTo: `/setup/${ flowName }/domains`,
			pageTitle: 'Bulk Transfer',
		} );

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			switch ( _currentStepSlug ) {
				case 'intro':
					clearSignupDestinationCookie();

					if ( userIsLoggedIn ) {
						return navigate( 'domains' );
					}
					return window.location.assign( logInUrl );
				case 'domains': {
					// go to processing step without pushing it to history
					// so the back button would go back to domains step
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
	use__Temporary__ShouldTrackEvent: ( event ) => 'submit' === event,
};

export default domainTransfer;
