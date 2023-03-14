import config from '@automattic/calypso-config';
import SubscriptionManager from '@automattic/subscription-manager';
import page, { Callback } from 'page';
import { createElement } from 'react';
import { makeLayout, render } from 'calypso/controller';

const SitesView: React.FunctionComponent = () => <span>Sites View</span>;
const CommentsView: React.FunctionComponent = () => <span>Comments View</span>;
const SettingsView: React.FunctionComponent = () => <span>Settings View</span>;

const SubscriptionManagementPage = () => {
	return (
		<SubscriptionManager>
			<SubscriptionManager.TabsSwitcher
				baseRoute="subscriptions"
				defaultTab="sites"
				tabs={ [
					{
						label: 'Sites',
						path: 'sites',
						view: SitesView,
						count: 2,
					},
					{
						label: 'Comments',
						path: 'comments',
						view: CommentsView,
						count: 5,
					},
					{
						label: 'Settings',
						path: 'settings',
						view: SettingsView,
					},
				] }
			/>
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
	page(
		/\/subscriptions(\/(comments|settings|sites))?/,
		checkFeatureFlag,
		createSubscriptions,
		makeLayout,
		render
	);
}
