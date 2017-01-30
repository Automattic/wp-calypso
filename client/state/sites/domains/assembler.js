/**
 * Internal dependencies
 */
import { getDomainType } from 'lib/domains/utils';

export const createSiteDomainObject = domain => {
	return {
		autoRenewalDate: String( domain.auto_renewal_date ),
		autoRenewing: Boolean( domain.auto_renewing ),
		blogId: Number( domain.blog_id ),
		canSetAsPrimary: Boolean( domain.can_set_as_primary ),
		currentUserCanManage: Boolean( domain.current_user_can_manage ),
		domain: String( domain.domain ),
		expired: Boolean( domain.expired ),
		expiry: ! domain.expiry ? null : String( domain.expiry ),
		expirySoon: Boolean( domain.expiry_soon ),
		googleAppsSubscription: Object( domain.google_apps_subscription ),
		hasPrivacyProtection: Boolean( domain.has_private_registration ),
		hasRegistration: Boolean( domain.has_registration ),
		hasZone: Boolean( domain.has_zone ),
		isPendingIcannVerification: Boolean( domain.is_pending_icann_verification ),
		isPrimary: Boolean( domain.primary_domain ),
		isPrivate: Boolean( domain.private_domain ),
		isWPCOMDomain: Boolean( domain.wpcom_domain ),
		manualTransferRequired: Boolean( domain.manual_transfer_required ),
		newRegistration: Boolean( domain.new_registration ),
		name: String( domain.domain ),
		owner: String( domain.owner ),
		partnerDomain: Boolean( domain.partner_domain ),
		pendingRegistration: Boolean( domain.pending_registration ),
		pendingRegistrationTime: String( domain.pending_registration_time ),
		pointsToWpcom: Boolean( domain.points_to_wpcom ),
		registrar: String( domain.registrar ),
		registrationDate: String( domain.registration_date ),
		type: getDomainType( domain )
	};
};
