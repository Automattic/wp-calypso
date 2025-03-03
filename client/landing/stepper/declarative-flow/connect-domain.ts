import { CONNECT_DOMAIN_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import { domainMapping } from 'calypso/lib/cart-values/cart-items';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT } from '../constants';
import { useDomainParams } from '../hooks/use-domain-params';
import { ONBOARD_STORE } from '../stores';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import { STEPS } from './internals/steps';
import { redirect } from './internals/steps-repository/import/util';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from './internals/types';

const CONNECT_DOMAIN_STEPS = stepsWithRequiredLogin( [
	STEPS.PLANS,
	STEPS.SITE_CREATION_STEP,
	STEPS.PROCESSING,
] );

const connectDomain: Flow = {
	name: CONNECT_DOMAIN_FLOW,
	get title() {
		return translate( 'Connect your domain' );
	},
	isSignupFlow: false,
	__experimentalUseBuiltinAuth: true,
	useAssertConditions: () => {
		const { domain } = useDomainParams();

		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( ! domain ) {
			redirect( '/start' );
			result = {
				state: AssertConditionState.FAILURE,
				message: 'connect-domain requires a domain query parameter',
			};
		}
		return result;
	},
	useSideEffect() {
		const { domain } = useDomainParams();
		const { setHideFreePlan, setDomainCartItem } = useDispatch( ONBOARD_STORE );

		useEffect( () => {
			if ( domain ) {
				setHideFreePlan( true );
				const domainCartItem = domainMapping( { domain } );
				setDomainCartItem( domainCartItem );
			}
		}, [] );
	},
	useSteps() {
		return CONNECT_DOMAIN_STEPS;
	},
	useTracksEventProps() {
		const { domain, provider } = useDomainParams();

		return useMemo(
			() => ( {
				eventsProperties: {
					[ STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT ]: {
						domain,
						provider,
					},
				},
			} ),
			[ domain, provider ]
		);
	},
	useStepNavigation( _currentStepSlug, navigate ) {
		const flowName = this.name;
		const { domain } = useDomainParams();

		triggerGuidesForStep( flowName, _currentStepSlug );

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			switch ( _currentStepSlug ) {
				case 'plans':
					clearSignupDestinationCookie();
					return navigate( 'create-site' );

				case 'create-site':
					return navigate( 'processing' );

				case 'processing': {
					const destination = `/domains/mapping/${ providedDependencies.siteSlug }/setup/${ domain }?firstVisit=true`;
					persistSignupDestination( destination );
					setSignupCompleteSlug( providedDependencies?.siteSlug );
					setSignupCompleteFlowName( flowName );
					const returnUrl = encodeURIComponent( destination );

					return window.location.assign(
						`/checkout/${ encodeURIComponent(
							( providedDependencies?.siteSlug as string ) ?? ''
						) }?redirect_to=${ returnUrl }&signup=1`
					);
				}
			}
			return providedDependencies;
		};

		return {
			submit,
		};
	},
};

export default connectDomain;
