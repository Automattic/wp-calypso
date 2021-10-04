import page from 'page';
import { DefaultRootState } from 'react-redux';
import { Dispatch } from 'redux';
import {
	AuthCodeValidationError,
	AuthCodeValidationHandler,
} from 'calypso/components/domains/connect-domain-step/types';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import { domainTransfer, updatePrivacyForDomain } from 'calypso/lib/cart-values/cart-items';
import { domainAvailability } from 'calypso/lib/domains/constants';
import wpcom from 'calypso/lib/wp';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import { getProductsList } from 'calypso/state/products-list/selectors';

const noop = () => null;
export const transferDomainAction: AuthCodeValidationHandler = (
	{ selectedSite, verificationData, domain },
	onDone = noop
) => async ( _: Dispatch< never >, getState: () => DefaultRootState ) => {
	const productsList = getProductsList( getState() );
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

		await cartManagerClient
			.forCartKey( selectedSite.ID.toString() )
			.actions.addProductsToCart( [ fillInSingleCartItemAttributes( transfer, productsList ) ] );
		return page( '/checkout/' + selectedSite.slug );
	} catch ( error ) {
		return onDone( error as AuthCodeValidationError );
	}
};
