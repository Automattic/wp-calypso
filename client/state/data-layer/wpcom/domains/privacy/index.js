/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { errorNotice, successNotice } from 'state/notices/actions';
import {
	DOMAIN_PRIVACY_ENABLE,
	DOMAIN_PRIVACY_DISABLE,
	DOMAIN_PRIVACY_ENABLE_SUCCESS,
	DOMAIN_PRIVACY_DISABLE_SUCCESS,
	DOMAIN_PRIVACY_DISABLE_FAILURE,
	DOMAIN_PRIVACY_ENABLE_FAILURE,
	DOMAIN_CONTACT_INFO_DISCLOSE,
	DOMAIN_CONTACT_INFO_DISCLOSE_SUCCESS,
	DOMAIN_CONTACT_INFO_DISCLOSE_FAILURE,
	DOMAIN_CONTACT_INFO_REDACT_SUCCESS,
	DOMAIN_CONTACT_INFO_REDACT_FAILURE,
	DOMAIN_CONTACT_INFO_REDACT,
} from 'state/action-types';

const saveDomainPrivacySettings = ( verb ) => ( action ) =>
	http(
		{
			apiVersion: '1',
			method: 'POST',
			path: '/domains/' + action.domain + '/privacy/' + verb,
		},
		action
	);

const getSuccessMessage = ( type ) => {
	switch ( type ) {
		case DOMAIN_PRIVACY_DISABLE_SUCCESS:
			return translate( 'Privacy has been successfully disabled!' );
		case DOMAIN_PRIVACY_ENABLE_SUCCESS:
			return translate( 'Yay, privacy has been successfully enabled!' );
		case DOMAIN_CONTACT_INFO_DISCLOSE_SUCCESS:
			return translate( 'Your contact information is now publicly visible!' );
		case DOMAIN_CONTACT_INFO_REDACT_SUCCESS:
			return translate( 'Your contact information is now redacted!' );
		default:
			return '';
	}
};

const handleDomainPrivacySettingsSuccess = ( type ) => ( { siteId, domain } ) => {
	const notice = getSuccessMessage( type );

	return [
		{
			type: type,
			siteId,
			domain,
		},
		successNotice( notice, { duration: 5000 } ),
	];
};

const handleDomainPrivacySettingsFailure = ( type ) => ( { siteId, domain }, data ) => {
	const notice = get(
		data,
		'message',
		translate( 'Unknown error when updating the domain privacy settings' )
	);
	return [
		{
			type: type,
			siteId,
			domain,
		},
		errorNotice( notice, {
			duration: 20000,
			id: 'domain-privacy-settings-save-failure-notice',
			isPersistent: true,
			href: 'https://wordpress.com/help/contact',
			button: translate( 'Get Help' ),
			showDismiss: false,
		} ),
	];
};

registerHandlers( 'state/data-layer/wpcom/domains/privacy/index.js', {
	[ DOMAIN_PRIVACY_ENABLE ]: [
		dispatchRequest( {
			fetch: saveDomainPrivacySettings( 'enable' ),
			onSuccess: handleDomainPrivacySettingsSuccess( DOMAIN_PRIVACY_ENABLE_SUCCESS ),
			onError: handleDomainPrivacySettingsFailure( DOMAIN_PRIVACY_ENABLE_FAILURE ),
		} ),
	],
	[ DOMAIN_PRIVACY_DISABLE ]: [
		dispatchRequest( {
			fetch: saveDomainPrivacySettings( 'disable' ),
			onSuccess: handleDomainPrivacySettingsSuccess( DOMAIN_PRIVACY_DISABLE_SUCCESS ),
			onError: handleDomainPrivacySettingsFailure( DOMAIN_PRIVACY_DISABLE_FAILURE ),
		} ),
	],
	[ DOMAIN_CONTACT_INFO_DISCLOSE ]: [
		dispatchRequest( {
			fetch: saveDomainPrivacySettings( 'disclose' ),
			onSuccess: handleDomainPrivacySettingsSuccess( DOMAIN_CONTACT_INFO_DISCLOSE_SUCCESS ),
			onError: handleDomainPrivacySettingsFailure( DOMAIN_CONTACT_INFO_DISCLOSE_FAILURE ),
		} ),
	],
	[ DOMAIN_CONTACT_INFO_REDACT ]: [
		dispatchRequest( {
			fetch: saveDomainPrivacySettings( 'redact' ),
			onSuccess: handleDomainPrivacySettingsSuccess( DOMAIN_CONTACT_INFO_REDACT_SUCCESS ),
			onError: handleDomainPrivacySettingsFailure( DOMAIN_CONTACT_INFO_REDACT_FAILURE ),
		} ),
	],
} );
