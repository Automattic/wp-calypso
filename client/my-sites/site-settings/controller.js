import page from '@automattic/calypso-router';
import { addQueryArgs } from '@wordpress/url';
import { billingHistory } from 'calypso/me/purchases/paths';
import SiteOwnerTransfer from 'calypso/sites/settings/administration/tools/transfer-site';
import { AcceptSiteTransfer } from 'calypso/sites/settings/administration/tools/transfer-site/accept-site-transfer';
import SiteTransferred from 'calypso/sites/settings/administration/tools/transfer-site/site-transferred';
import DisconnectSite from './disconnect-site';
import ConfirmDisconnection from './disconnect-site/confirm';
import ManageConnection from './manage-connection';

export function disconnectSite( context, next ) {
	context.primary = <DisconnectSite reason={ context.params.reason } type={ context.query.type } />;
	next();
}

export function disconnectSiteConfirm( context, next ) {
	const { reason, type, text } = context.query;
	context.primary = <ConfirmDisconnection reason={ reason } type={ type } text={ text } />;
	next();
}

export function manageConnection( context, next ) {
	context.primary = <ManageConnection />;
	next();
}

export function startSiteOwnerTransfer( context, next ) {
	context.primary = <SiteOwnerTransfer />;
	next();
}

export function renderSiteTransferredScreen( context, next ) {
	context.primary = <SiteTransferred />;
	next();
}

export function acceptSiteTransfer( context, next ) {
	context.primary = (
		<AcceptSiteTransfer
			siteId={ context.params.site_id }
			inviteKey={ context.params.invitation_key }
			redirectTo={ context.query.nextStep }
			dispatch={ context.store.dispatch }
		/>
	);
	next();
}

export function legacyRedirects( context, next ) {
	const { section } = context.params;
	const redirectMap = {
		account: '/me/account',
		password: '/me/security',
		'public-profile': '/me/public-profile',
		notifications: '/me/notifications',
		disbursements: '/me/public-profile',
		earnings: '/me/public-profile',
		'billing-history': billingHistory,
		'billing-history-v2': billingHistory,
		'connected-apps': '/me/security/connected-applications',
	};

	if ( section === 'account' && context.query.new_email_result ) {
		return page.redirect(
			addQueryArgs( '/me/account', { new_email_result: context.query.new_email_result } )
		);
	}

	if ( redirectMap[ section ] ) {
		return page.redirect( redirectMap[ section ] );
	}

	next();
}

export function redirectToTraffic( context ) {
	return page.redirect( '/marketing/traffic/' + context.params.site_id );
}

export function redirectToGeneral( context ) {
	const siteFragment = context.params.site_id ? `/${ context.params.site_id }` : '';
	return page.redirect( `/settings/general${ siteFragment }` );
}
