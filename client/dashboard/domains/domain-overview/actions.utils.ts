import { Domain } from '../../data/domain';

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
