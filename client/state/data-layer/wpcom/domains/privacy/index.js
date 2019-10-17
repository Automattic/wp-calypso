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
} from 'state/action-types';

const saveDomainPrivacySettings = verb => action =>
	http(
		{
			apiVersion: '1',
			method: 'POST',
			path: '/domains/' + action.domain + '/privacy/' + verb,
		},
		action
	);

const handleDomainPrivacySettingsSuccess = type => ( { siteId, domain } ) => {
	const notice =
		DOMAIN_PRIVACY_DISABLE_SUCCESS === type
			? translate( 'Privacy has been successfully disabled!' )
			: translate( 'Yay, privacy has been successfully enabled!' );

	return [
		{
			type: type,
			siteId,
			domain,
		},
		successNotice( notice, { duration: 5000 } ),
	];
};

const handleDomainPrivacySettingsFailure = type => ( { siteId, domain }, data ) => {
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
			button: 'Get Help',
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
} );
