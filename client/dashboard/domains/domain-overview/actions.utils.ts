import { Domain } from '../../data/domain';
import { DomainTransferStatus } from '../../data/domains';

export const shouldShowTransferAction = ( domain: Domain ) => {
	if (
		! domain.current_user_is_owner ||
		domain.is_redeemable ||
		domain.pending_registration ||
		domain.pending_registration_at_registry ||
		domain.move_to_new_site_pending ||
		domain.aftermarket_auction
	) {
		return false;
	}

	return true;
};

export const shouldShowDisconnectAction = ( domain: Domain ) => {
	if (
		domain.is_domain_only_site ||
		domain.move_to_new_site_pending ||
		! domain.current_user_is_owner
	) {
		return false;
	}

	return true;
};

export const shouldShowDeleteAction = ( domain: Domain ) => {
	if (
		! domain.current_user_is_owner ||
		domain.pending_registration ||
		domain.move_to_new_site_pending ||
		domain.transfer_status === DomainTransferStatus.PENDING_ASYNC
	) {
		return false;
	}

	return true;
};
