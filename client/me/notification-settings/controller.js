/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import userSettings from 'calypso/lib/user-settings';
import { setDocumentHeadTitle as setTitle } from 'calypso/state/document-head/actions';
import NotificationsComponent from 'calypso/me/notification-settings/main';
import CommentSettingsComponent from 'calypso/me/notification-settings/comment-settings';
import WPcomSettingsComponent from 'calypso/me/notification-settings/wpcom-settings';
import NotificationSubscriptions from 'calypso/me/notification-settings/reader-subscriptions';

export function notifications( context, next ) {
	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Notifications', { textOnly: true } ) ) );

	context.primary = React.createElement( NotificationsComponent, {
		userSettings: userSettings,
		path: context.path,
	} );
	next();
}

export function comments( context, next ) {
	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch(
		setTitle( i18n.translate( 'Comments on other sites', { textOnly: true } ) )
	);

	context.primary = React.createElement( CommentSettingsComponent, {
		path: context.path,
	} );
	next();
}

export function updates( context, next ) {
	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch(
		setTitle( i18n.translate( 'Updates from WordPress.com', { textOnly: true } ) )
	);

	context.primary = React.createElement( WPcomSettingsComponent, {
		path: context.path,
	} );
	next();
}

export function subscriptions( context, next ) {
	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Notifications', { textOnly: true } ) ) );

	context.primary = React.createElement( NotificationSubscriptions, {
		userSettings: userSettings,
		path: context.path,
	} );
	next();
}
