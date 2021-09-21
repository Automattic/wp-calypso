import { UseShoppingCart, WithShoppingCartProps } from '@automattic/shopping-cart';
import TransferDomainStepAuthCode from 'calypso/components/domains/connect-domain-step/transfer-domain-step-auth-code';
import {
	AuthCodeValidationData,
	AuthCodeValidationError,
	AuthCodeValidationHandler,
} from 'calypso/components/domains/connect-domain-step/types';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import { domainTransfer, updatePrivacyForDomain } from 'calypso/lib/cart-values/cart-items';
import { domainAvailability } from 'calypso/lib/domains/constants';
import wpcom from 'calypso/lib/wp';

const noop = () => null;
export const transferDomainAction: AuthCodeValidationHandler = (
	{ selectedSite, verificationData, domain },
	onDone = noop
) => async (
	_: unknown,
	{
		shoppingCartManager,
	}: React.ComponentProps< typeof TransferDomainStepAuthCode > & WithShoppingCartProps
) => {
	const transferrableStatuses = [
		domainAvailability.TRANSFERRABLE,
		domainAvailability.MAPPED_SAME_SITE_TRANSFERRABLE,
	];

	if ( ! selectedSite ) return onDone( { message: 'Please specify a site.' } );

	try {
		const wpcomDomain = wpcom.domain( domain );
		const authCode = verificationData.ownership_verification_data.verification_data;

		const authCodeCheckResult = await wpcomDomain.checkAuthCode( authCode );

		if ( ! authCodeCheckResult.success )
			return onDone( {
				error: 'ownership_verification_failed',
				message: 'Invalid auth code. Please check the specified code and try again.',
			} );

		const checkAvailabilityResult = await wpcomDomain.isDomainAvailable( selectedSite.ID, false );
		let supportsPrivacy = false;

		if ( transferrableStatuses.includes( checkAvailabilityResult.status ) ) {
			supportsPrivacy = checkAvailabilityResult.supports_privacy;
		}

		let transfer = domainTransfer( {
			domain,
			extra: {
				auth_code: authCode,
				privacy_available: supportsPrivacy,
			},
		} );

		if ( supportsPrivacy ) {
			transfer = updatePrivacyForDomain( transfer, true );
		}

		await shoppingCartManager.addProductsToCart( [ transfer ] );
		return page( '/checkout/' + selectedSite.slug );
	} catch ( error ) {
		return onDone( error as AuthCodeValidationError );
	}
};
