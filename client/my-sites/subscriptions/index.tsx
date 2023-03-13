import config from '@automattic/calypso-config';
import SubscriptionManager from '@automattic/subscription-manager';
import page, { Callback } from 'page';
import { createElement } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { makeLayout, render } from 'calypso/controller';

const SiteSubscriptions = () => 'Site Subscriptions';
const SubscriptionSettings = () => 'Subscription Settings';

const SubscriptionManagementPage = () => {
	return (
		<SubscriptionManager>
			{ /* <SubscriptionManager.Tabs>
				<SubscriptionManager.Tab name="sites" />
				<SubscriptionManager.Tab name="settings" />
			</SubscriptionManager.Tabs> */ }

			<BrowserRouter>
				<Switch>
					<Route path="/subscriptions/sites" render={ SiteSubscriptions } />
					<Route path="/subscriptions/settings" render={ SubscriptionSettings } />
				</Switch>
			</BrowserRouter>
		</SubscriptionManager>
	);
};

const createSubscriptions: Callback = ( context, next ) => {
	context.primary = createElement( SubscriptionManagementPage );
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
	page( '/subscriptions/settings', checkFeatureFlag, createSubscriptions, makeLayout, render );
	page( '/subscriptions/sites', checkFeatureFlag, createSubscriptions, makeLayout, render );
}
