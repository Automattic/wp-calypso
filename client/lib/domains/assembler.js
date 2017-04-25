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
import { getDomainType } from './utils';

function createDomainObjects( dataTransferObject ) {
	let domains = [];

	if ( ! Array.isArray( dataTransferObject ) ) {
		return domains;
	}

	domains = dataTransferObject.map( ( domain ) => {
		return {
			autoRenewalMoment: domain.auto_renewal_date && i18n.moment( domain.auto_renewal_date ),
			currentUserCanManage: domain.current_user_can_manage,
			expirationMoment: domain.expiry && i18n.moment( domain.expiry ),
			expired: domain.expired,
			expirySoon: domain.expiry_soon,
			googleAppsSubscription: assembleGoogleAppsSubscription( domain.google_apps_subscription ),
			hasPrivacyProtection: domain.has_private_registration,
			isAutoRenewing: domain.auto_renewing,
			isPendingIcannVerification: domain.is_pending_icann_verification,
			isPrimary: domain.primary_domain,
			manualTransferRequired: domain.manual_transfer_required,
			name: domain.domain,
			owner: domain.owner,
			privateDomain: domain.private_domain,
			pendingTransfer: domain.pending_transfer,
			registrar: domain.registrar,
			registrationMoment: domain.registration_date && i18n.moment( domain.registration_date ),
			hasZone: domain.has_zone,
			pointsToWpcom: domain.points_to_wpcom,
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
