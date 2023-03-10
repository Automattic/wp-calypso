import config from '@automattic/calypso-config';
import SubscriptionManager from '@automattic/subscription-manager';
import page, { Callback } from 'page';
import { createElement } from 'react';
import { makeLayout, render } from 'calypso/controller';

const createSubscriptions: Callback = ( context, next ) => {
	context.primary = createElement( SubscriptionManager );
	next();
};

const checkFeatureFlag: Callback = ( context, next ) => {
	if ( config.isEnabled( 'subscription-management' ) ) {
		next();
		return;
	}
	page.redirect( '/' );
};

export default function () {
	page( '/subscriptions', checkFeatureFlag, createSubscriptions, makeLayout, render );
}
