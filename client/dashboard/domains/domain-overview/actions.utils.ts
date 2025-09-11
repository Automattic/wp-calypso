import { Domain, DomainSubtype, DomainTransferStatus, Purchase, Site } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { isAkismetProduct } from '../../utils/purchase';

export const transferableTypes: DomainSubtype[] = [
	DomainSubtype.DEFAULT_ADDRESS,
	DomainSubtype.DOMAIN_CONNECTION,
	DomainSubtype.DOMAIN_REGISTRATION,
];
export const disconnectableTypes: DomainSubtype[] = [ DomainSubtype.DOMAIN_REGISTRATION ];

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

export const shouldShowDeleteAction = ( domain: Domain, purchase?: Purchase, site?: Site ) => {
	if (
		! domain.current_user_is_owner ||
		domain.pending_registration ||
		domain.move_to_new_site_pending ||
		domain.transfer_status === DomainTransferStatus.PENDING_ASYNC
	) {
		return false;
	}

	if (
		! purchase ||
		! purchase.is_removable ||
		// If we have a disconnected site that is _not_ a Jetpack purchase _or_ an Akismet purchase, no removal allowed.
		( ! site && ! purchase.is_jetpack_plan_or_product && ! isAkismetProduct( purchase ) )
	) {
		return false;
	}

	return true;
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
