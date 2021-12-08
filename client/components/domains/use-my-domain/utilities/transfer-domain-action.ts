import page from 'page';
import { DefaultRootState } from 'react-redux';
import { Dispatch } from 'redux';
import {
	transferDomainError,
	useMyDomainInputMode as inputMode,
} from 'calypso/components/domains/connect-domain-step/constants';
import {
	AuthCodeValidationError,
	AuthCodeValidationHandler,
} from 'calypso/components/domains/connect-domain-step/types';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import { domainTransfer, updatePrivacyForDomain } from 'calypso/lib/cart-values/cart-items';
import { domainAvailability } from 'calypso/lib/domains/constants';
import wpcom from 'calypso/lib/wp';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import { domainManagementTransferIn } from 'calypso/my-sites/domains/paths';
import { getProductsList } from 'calypso/state/products-list/selectors';

const noop = () => null;
export const transferDomainAction: AuthCodeValidationHandler = (
	{ selectedSite, verificationData, domain, ...props },
	onDone = noop
) => async ( _: Dispatch< never >, getState: () => DefaultRootState ) => {
	const mode = ( props as Record< string, string > ).initialMode;
	const productsList = getProductsList( getState() );
	const transferrableStatuses = [
		domainAvailability.TRANSFERRABLE,
		domainAvailability.MAPPED_SAME_SITE_TRANSFERRABLE,
	];

	if ( ! selectedSite ) return onDone( { message: transferDomainError.NO_SELECTED_SITE } );

	try {
		const wpcomDomain = wpcom.domain( domain );
		const authCode = verificationData.ownership_verification_data.verification_data;

		const authCodeCheckResult = await wpcomDomain.checkAuthCode( authCode );

		if ( ! authCodeCheckResult.success )
			return onDone( {
				error: 'ownership_verification_failed',
				message: transferDomainError.AUTH_CODE,
			} );

		const checkAvailabilityResult = await wpcom.req.get(
			`/domains/${ encodeURIComponent( domain ) }/is-available`,
			{
				blog_id: selectedSite.ID,
				apiVersion: '1.3',
				is_cart_pre_check: false,
			}
		);
		const addTransferToCartAndCheckout = async () => {
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
		};

		const startInboundTransferAndReload = async () => {
			try {
				const result = await wpcom.req.get(
					`/domains/${ encodeURIComponent( domain ) }/inbound-transfer-start/${ selectedSite.ID }`,
					authCode ? { auth_code: authCode } : {}
				);
				if ( result.success ) {
					page( domainManagementTransferIn( selectedSite.slug, domain ) );
				} else {
					return onDone( {
						message: transferDomainError.GENERIC_ERROR,
					} );
				}
			} catch ( error ) {
				return onDone( {
					message: transferDomainError.GENERIC_ERROR,
				} );
			}
		};

		if ( inputMode.transferDomain === mode ) {
			await startInboundTransferAndReload();
		} else {
			await addTransferToCartAndCheckout();
		}
	} catch ( error ) {
		return onDone( error as AuthCodeValidationError );
	}
};
