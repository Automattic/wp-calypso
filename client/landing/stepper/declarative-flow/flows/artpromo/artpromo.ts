import { DomainAvailabilityStatus, fetchDomainAvailability } from '@automattic/api-core';
import { ART_PROMO_FLOW, addProductsToCart } from '@automattic/onboarding';
import { useQuery } from '../../../hooks/use-query';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import type { FlowV2 } from '../../internals/types';

function initialize() {
	return stepsWithRequiredLogin( [ STEPS.PROCESSING ] );
}

const artPromoFlow: FlowV2< typeof initialize > = {
	name: ART_PROMO_FLOW,
	isSignupFlow: false,
	__experimentalUseBuiltinAuth: true,
	initialize,

	useStepNavigation() {
		const flowName = this.name;
		const queryParams = useQuery();
		const domain = queryParams.get( 'new' ) || '';

		const submit = async () => {
			if ( ! domain ) {
				return window.location.assign( '/' );
			}

			const availability = await fetchDomainAvailability( domain, {
				is_cart_pre_check: true,
			} );

			if (
				! [
					DomainAvailabilityStatus.AVAILABLE,
					DomainAvailabilityStatus.AVAILABLE_PREMIUM,
				].includes( availability.status ) ||
				! availability.product_slug
			) {
				return window.location.assign( '/domains' );
			}

			await addProductsToCart( 'no-site', flowName, [
				{
					product_slug: availability.product_slug,
					meta: domain,
					extra: {
						is_art_promo: true,
						privacy_available: availability.supports_privacy,
						privacy: availability.supports_privacy,
					},
				},
			] );

			return window.location.replace( '/checkout/no-site?signup=0&isDomainOnly=1' );
		};

		return { submit };
	},
};

export default artPromoFlow;
