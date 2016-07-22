/**
 * External dependencies
 */
import find from 'lodash/find';
import without from 'lodash/without';
import mapKeys from 'lodash/mapKeys';
import camelCase from 'lodash/camelCase';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { type as domainTypes } from './constants';

function createDomainObjects( dataTransferObject ) {
	let domains = [];

	if ( ! Array.isArray( dataTransferObject ) ) {
		return domains;
	}

	domains = dataTransferObject.map( ( domain ) => {
		return {
			autoRenewalDate: domain.auto_renewal_date,
			expirationMoment: domain.expiry ? i18n.moment( domain.expiry ) : null,
			expired: domain.expired,
			expirySoon: domain.expiry_soon,
			googleAppsSubscription: assembleGoogleAppsSubscription( domain.google_apps_subscription ),
			hasPrivacyProtection: domain.has_private_registration,
			isAutoRenewing: domain.auto_renewing,
			currentUserCanManage: domain.current_user_can_manage || domain.is_current_user_owner,
			isWhoisEditable: domain.is_whois_editable,
			isPendingIcannVerification: domain.is_pending_icann_verification,
			isPrimary: domain.primary_domain,
			manualTransferRequired: domain.manual_transfer_required,
			name: domain.domain,
			privateDomain: domain.private_domain,
			registrationDate: domain.registration_date,
			registrationMoment: domain.registration_date && i18n.moment( domain.registration_date, 'MMMM D, YYYY', 'en' ).locale( false ),
			type: getDomainType( domain )
		};
	} );

	return ensurePrimaryDomainIsFirst( domains );
}

function assembleGoogleAppsSubscription( googleAppsSubscription ) {
	if ( ! googleAppsSubscription ) {
		return;
	}

	return mapKeys( googleAppsSubscription, ( value, key ) => camelCase( key ) );
}

function getDomainType( domainFromApi ) {
	if ( domainFromApi.type === 'redirect' ) {
		return domainTypes.SITE_REDIRECT;
	}

	if ( domainFromApi.wpcom_domain ) {
		return domainTypes.WPCOM;
	}

	if ( domainFromApi.has_registration ) {
		return domainTypes.REGISTERED;
	}

	return domainTypes.MAPPED;
}

function ensurePrimaryDomainIsFirst( domains ) {
	const primaryDomain = find( domains, { isPrimary: true } );

	if ( ! primaryDomain ) {
		return domains;
	}

	return [ primaryDomain ].concat( without( domains, primaryDomain ) );
}

module.exports = {
	createDomainObjects
};
