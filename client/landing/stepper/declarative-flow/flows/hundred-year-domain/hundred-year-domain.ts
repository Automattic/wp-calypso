import { OnboardSelect } from '@automattic/data-stores';
import { HUNDRED_YEAR_DOMAIN_FLOW, addProductsToCart } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { useDispatch, useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { ONBOARD_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import type { ProvidedDependencies, Flow } from '../../internals/types';
import './style.scss';

const steps = [ STEPS.DOMAINS, ...stepsWithRequiredLogin( [ STEPS.PROCESSING ] ) ];

const HundredYearDomainFlow: Flow = {
	name: HUNDRED_YEAR_DOMAIN_FLOW,
	isSignupFlow: true,

	get title() {
		return translate( '100-Year Domain' );
	},

	useSteps() {
		return steps;
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const checkoutBackUrl = new URL( `/setup/${ flowName }/domains`, window.location.href );

		const { setDomainCartItem } = useDispatch( ONBOARD_STORE );

		const { domainCartItem } = useSelect(
			( select ) => ( {
				domainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem(),
			} ),
			[]
		);

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			const { domainName, productSlug } = providedDependencies;

			const submittedDomainCartItem = domainRegistration( {
				productSlug: productSlug as string,
				domain: domainName as string,
				extra: { is_hundred_year_domain: true },
				volume: 100,
			} );

			switch ( _currentStep ) {
				case 'domains':
					clearSignupDestinationCookie();
					setDomainCartItem( submittedDomainCartItem );
					return navigate( 'processing' );

				case 'processing':
					setSignupCompleteSlug( providedDependencies.siteSlug );
					setSignupCompleteFlowName( flowName );

					await addProductsToCart( 'no-site', flowName, [
						domainCartItem as MinimalRequestCartProduct,
					] );
					// Delay to keep the "Setting up your legacy..." page showing for 2 seconds
					// since there's nothing to actually process in that step
					await new Promise( ( resolve ) => setTimeout( resolve, 2000 ) );

					// use replace instead of assign to remove the processing URL from history
					return window.location.replace(
						`/checkout/no-site?signup=1&isDomainOnly=1&checkoutBackUrl=${ encodeURIComponent(
							checkoutBackUrl.href
						) }`
					);
			}
		}

		const exitFlow = ( location = '/sites' ) => {
			window.location.assign( location );
		};

		return { exitFlow, submit };
	},
};

export default HundredYearDomainFlow;
