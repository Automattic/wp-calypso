/**
 * External dependencies
 */
const find = require( 'lodash/collection/find' ),
	without = require( 'lodash/array/without' ),
	mapKeys = require( 'lodash/object/mapKeys' ),
	camelCase = require( 'lodash/string/camelCase' );

/**
 * Internal dependencies
 */
const domainTypes = require( './constants' ).type,
	i18n = require( 'lib/mixins/i18n' );

function createDomainObjects( dataTransferObject ) {
	let domains = [];

	if ( ! Array.isArray( dataTransferObject ) ) {
		return domains;
	}

	domains = dataTransferObject.map( ( domain ) => {
		return {
			autoRenewalDate: domain.auto_renewal_date,
			expirationDate: domain.expiry,
			expirationMoment: domain.expiry && i18n.moment( domain.expiry, 'MMMM D, YYYY', 'en' ).locale( false ),
			expired: domain.expired,
			expirySoon: domain.expiry_soon,
			googleAppsSubscription: assembleGoogleAppsSubscription( domain.google_apps_subscription ),
			hasPrivacyProtection: domain.has_private_registration,
			isAutoRenewing: domain.auto_renewing,
			isPendingIcannVerification: domain.is_pending_icann_verification,
			isPrimary: domain.primary_domain,
			manualTransferRequired: domain.manual_transfer_required,
			name: domain.domain,
			privateDomain: domain.private_domain,
			registrationDate: domain.registration_date,
			registrationMoment: domain.registration_date && i18n.moment( domain.registration_date, 'MMMM D, YYYY', 'en' ).locale( false ),
			transferProhibited: domain.transfer_prohibited,
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
