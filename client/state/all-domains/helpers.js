import { getDomainType } from 'calypso/lib/domains/utils';

export const createLightSiteDomainObject = ( domain ) => {
	return {
		blogId: Number( domain.blog_id ),
		domain: String( domain.domain ),
		expiry: ! domain.expiry ? null : String( domain.expiry ),
		hasRegistration: Boolean( domain.has_registration ),
		isWPCOMDomain: Boolean( domain.wpcom_domain ),
		isWpcomStagingDomain: Boolean( domain.is_wpcom_staging_domain ),
		name: String( domain.domain ),
		registrationDate: String( domain.registration_date ),
		type: getDomainType( domain ),
		siteSlug: String( domain.site_slug ),
		siteTitle: String( domain.blog_name ),
		isDomainOnlySite: Boolean( domain.is_domain_only_site ),
		currentUserIsOwner: Boolean( domain.current_user_is_owner ),
	};
};
