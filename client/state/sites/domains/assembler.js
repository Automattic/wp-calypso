/**
 * External dependencies
 */

export const createSiteDomainObject = domain => {
	return {
		autoRenewalDate: String( domain.auto_renewal_date ),
		autoRenewing: Boolean( domain.auto_renewing ),
		blogId: Number( domain.blog_id ),
		canSetAsPrimary: Boolean( domain.can_set_as_primary ),
		domain: String( domain.domain ),
		expired: Boolean( domain.expired ),
		expiry: String( domain.expiry ),
		expirySoon: Boolean( domain.expiry_soon ),
		googleAppsSubscription: Object( domain.google_apps_subscription ),
		hasPrivateRegistration: Boolean( domain.has_private_registration ),
		hasRegistration: Boolean( domain.has_registration ),
		hasZone: Boolean( domain.has_zone ),
		isPendingIcannVerification: Boolean( domain.is_pending_icann_verification ),
		manualTransferRequired: Boolean( domain.manual_transfer_required ),
		newRegistration: Boolean( domain.new_registration ),
		partnerDomain: Boolean( domain.partner_domain ),
		pendingRegistration: Boolean( domain.pending_registration ),
		pendingRegistrationTime: String( domain.pending_registration_time ),
		isPrimary: Boolean( domain.primary_domain ),
		isPrivate: Boolean( domain.private_domain ),
		registrationDate: String( domain.registration_date ),
		type: String( domain.type ),
		isWPCOMDomain: Boolean( domain.wpcom_domain )
	};
};
