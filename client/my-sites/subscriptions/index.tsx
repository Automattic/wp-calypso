import config from '@automattic/calypso-config';
import SubscriptionManager from '@automattic/subscription-manager';
import page, { Callback } from 'page';
import { createElement } from 'react';
import { makeLayout, render } from 'calypso/controller';

const SubscriptionManagementPage = () => {
	return (
		<SubscriptionManager>
			<SubscriptionManager.Tabs>
				<SubscriptionManager.Tab path="/subscriptions/sites">Sites</SubscriptionManager.Tab>
				<SubscriptionManager.Tab path="/subscriptions/settings">Settings</SubscriptionManager.Tab>
			</SubscriptionManager.Tabs>

			{ /* <SubscriptionManager.Router>
				<SubscriptionManager.Route path="/subscriptions/sites">
					Sites content here
				</SubscriptionManager.Route>
				<SubscriptionManager.Route path="/subscriptions/settings">
					Settings content here
				</SubscriptionManager.Route>
			</SubscriptionManager.Router> */ }
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
	page( '/subscriptions', checkFeatureFlag, createSubscriptions, makeLayout, render );
}
