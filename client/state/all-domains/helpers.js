import { getDomainType } from 'calypso/lib/domains/utils';

export const createLightSiteDomainObject = ( domain ) => {
	return {
		blogId: Number( domain.blog_id ),
		domain: String( domain.domain ),
		expiry: ! domain.expiry ? null : String( domain.expiry ),
		hasRegistration: Boolean( domain.has_registration ),
		isWPCOMDomain: Boolean( domain.wpcom_domain ),
		isDomainOnlySite: Boolean( domain.is_domain_only_site ),
		isWpcomStagingDomain: Boolean( domain.is_wpcom_staging_domain ),
		name: String( domain.domain ),
		registrationDate: String( domain.registration_date ),
		siteSlug: String( domain.site_slug ),
		type: getDomainType( domain ),
		currentUserIsOwner: Boolean( domain.current_user_is_owner ),
	};
};
