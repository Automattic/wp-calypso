import config from '@automattic/calypso-config';
import SubscriptionManager from '@automattic/subscription-manager';
import { useTranslate } from 'i18n-calypso';
import page, { Callback } from 'page';
import { createElement } from 'react';
import { makeLayout, render } from 'calypso/controller';

const SitesView: React.FunctionComponent = () => <span>Sites View</span>;
const CommentsView: React.FunctionComponent = () => <span>Comments View</span>;
const SettingsView: React.FunctionComponent = () => <span>Settings View</span>;

const SubscriptionManagementPage = () => {
	const translate = useTranslate();

	return (
		<SubscriptionManager>
			<SubscriptionManager.TabsSwitcher
				baseRoute="subscriptions"
				defaultTab="sites"
				tabs={ [
					{
						label: translate( 'Sites' ),
						path: 'sites',
						view: SitesView,
						count: 2,
					},
					{
						label: translate( 'Comments' ),
						path: 'comments',
						view: CommentsView,
						count: 5,
					},
					{
						label: translate( 'Settings' ),
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
	page.redirect( '/subscriptions', '/subscriptions/sites' );

	page(
		/\/subscriptions(\/(comments|settings|sites))?/,
		checkFeatureFlag,
		createSubscriptions,
		makeLayout,
		render
	);
}
