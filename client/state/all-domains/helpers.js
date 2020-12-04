/**
 * Internal dependencies
 */
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
	};
};
