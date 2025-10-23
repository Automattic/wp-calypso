import { Domain, DomainSubtype, DomainTransferStatus, Purchase } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';

export const transferableTypes: DomainSubtype[] = [
	DomainSubtype.DEFAULT_ADDRESS,
	DomainSubtype.DOMAIN_CONNECTION,
	DomainSubtype.DOMAIN_REGISTRATION,
];
export const disconnectableTypes: DomainSubtype[] = [ DomainSubtype.DOMAIN_REGISTRATION ];

export const canAutoRenewBeTurnedOff = ( purchase: Purchase ) => {
	if ( [ 'included', 'expired' ].includes( purchase.expiry_status ) ) {
		return false;
	}

	if ( purchase.is_refundable && purchase.refund_amount > 0 ) {
		return true;
	}

	return purchase.is_auto_renew_enabled;
};

export const shouldShowTransferAction = ( domain: Domain ) => {
	if (
		! domain.current_user_is_owner ||
		domain.is_redeemable ||
		domain.pending_registration ||
		domain.pending_registration_at_registry ||
		domain.move_to_new_site_pending ||
		domain.aftermarket_auction ||
		! transferableTypes.includes( domain.subtype.id )
	) {
		return false;
	}

	return true;
};

export const shouldShowDisconnectAction = ( domain: Domain ) => {
	if (
		domain.is_domain_only_site ||
		domain.move_to_new_site_pending ||
		! domain.current_user_is_owner ||
		! disconnectableTypes.includes( domain.subtype.id )
	) {
		return false;
	}

	return true;
};

export const shouldShowRemoveAction = ( domain: Domain, purchase?: Purchase ) => {
	if (
		! domain.current_user_is_owner ||
		domain.pending_registration ||
		domain.move_to_new_site_pending ||
		domain.transfer_status === DomainTransferStatus.PENDING_ASYNC ||
		domain.is_hundred_year_domain
	) {
		return false;
	}

	if ( ! purchase ) {
		return false;
	}

	if ( purchase.is_locked ) {
		return false;
	}

	if ( canAutoRenewBeTurnedOff( purchase ) ) {
		return false;
	}

	return true;
};

export const shouldShowCancelAction = ( domain: Domain, purchase?: Purchase ) => {
	if (
		! domain.current_user_is_owner ||
		domain.pending_registration ||
		domain.move_to_new_site_pending ||
		domain.transfer_status === DomainTransferStatus.PENDING_ASYNC ||
		domain.is_hundred_year_domain
	) {
		return false;
	}

	if ( ! purchase ) {
		return false;
	}

	if ( purchase.is_locked ) {
		return false;
	}

	if ( ! canAutoRenewBeTurnedOff( purchase ) ) {
		return false;
	}

	if (
		purchase.product_slug === 'domain_transfer' &&
		! ( purchase.is_refundable && purchase.refund_amount > 0 )
	) {
		return false;
	}

	return true;
};

export const shouldShowTransferInAction = ( domain: Domain ) => {
	return (
		domain.is_eligible_for_inbound_transfer && domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION
	);
};

// Delete action utils
export const getDeleteTitle = ( domain: Domain ) => {
	switch ( domain.subtype.id ) {
		case DomainSubtype.DOMAIN_TRANSFER:
			return __( 'Cancel transfer' );
		default:
			return __( 'Delete' );
	}
};

export const getDeleteLabel = ( domain: Domain ) => {
	switch ( domain.subtype.id ) {
		case DomainSubtype.DOMAIN_TRANSFER:
			return __( 'Cancel' );
		default:
			return __( 'Delete' );
	}
};

export const getDeleteDescription = ( domain: Domain ) => {
	switch ( domain.subtype.id ) {
		case DomainSubtype.SITE_REDIRECT:
			return __( 'Remove this site redirect permanently.' );
		case DomainSubtype.DOMAIN_CONNECTION:
			return __( 'Remove this domain connection permanently.' );
		case DomainSubtype.DOMAIN_TRANSFER:
			return __( 'Cancel this domain transfer.' );
		default:
			return __( 'Remove this domain permanently.' );
	}
};
