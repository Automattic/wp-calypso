import { __ } from '@wordpress/i18n';
import page from 'page';
import {
	transferDomainError,
	useMyDomainInputMode as inputMode,
} from 'calypso/components/domains/connect-domain-step/constants';
import {
	AuthCodeValidationError,
	AuthCodeValidationHandler,
} from 'calypso/components/domains/connect-domain-step/types';
import { domainTransfer, updatePrivacyForDomain } from 'calypso/lib/cart-values/cart-items';
import { startInboundTransfer } from 'calypso/lib/domains';
import { domainAvailability } from 'calypso/lib/domains/constants';
import wpcom from 'calypso/lib/wp';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import { domainManagementTransferIn } from 'calypso/my-sites/domains/paths';

const noop = () => null;
export const transferDomainAction: AuthCodeValidationHandler =
	( { selectedSite, verificationData, domain, ...props }, onDone = noop ) =>
	async () => {
		const mode = ( props as Record< string, string > ).initialMode;
		const transferrableStatuses = [
			domainAvailability.TRANSFERRABLE,
			domainAvailability.MAPPED_SAME_SITE_TRANSFERRABLE,
		];

		if ( ! selectedSite ) {
			return onDone( { message: transferDomainError.NO_SELECTED_SITE } );
		}

		try {
			const authCode = verificationData.ownership_verification_data.verification_data;
			const authCodeCheckResult = await wpcom.req.get(
				`/domains/${ encodeURIComponent( domain ) }/inbound-transfer-check-auth-code`,
				{ auth_code: authCode }
			);

			if ( ! authCodeCheckResult.success ) {
				return onDone( {
					error: 'ownership_verification_failed',
					message: transferDomainError.AUTH_CODE,
				} );
			}

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
					.forCartKey( selectedSite.ID )
					.actions.addProductsToCart( [ transfer ] );
				return page( '/checkout/' + selectedSite.slug );
			};

			const startInboundTransferAndReload = async () => {
				try {
					await startInboundTransfer( selectedSite.ID, domain, authCode );
					page( domainManagementTransferIn( selectedSite.slug, domain ) );
				} catch ( error ) {
					const errorMessage = error instanceof Error ? error.message : String( error );
					const message =
						transferDomainError.GENERIC_ERROR +
						' ' +
						__( 'Error message: ' ) +
						`"${ errorMessage }"`;
					onDone( { message } );
				}
			};

			if ( inputMode.startPendingTransfer === mode ) {
				await startInboundTransferAndReload();
			} else {
				await addTransferToCartAndCheckout();
			}
		} catch ( error ) {
			return onDone( error as AuthCodeValidationError );
		}
	};
