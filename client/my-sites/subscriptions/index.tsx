import config from '@automattic/calypso-config';
import { Reader } from '@automattic/data-stores';
import SubscriptionManager from '@automattic/subscription-manager';
import { useTranslate } from 'i18n-calypso';
import page, { Callback } from 'page';
import { createElement } from 'react';
import { makeLayout, render } from 'calypso/controller';

const SitesView = () => <span>Sites View</span>;
const CommentsView = () => <span>Comments View</span>;
const SettingsView = () => <SubscriptionManager.UserSettings />;

const SubscriptionManagementPage = () => {
	const translate = useTranslate();
	const { data: counts } = Reader.useSubscriptionManagerSubscriptionsCountQuery();

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
						count: counts?.blogs || undefined,
					},
					{
						label: translate( 'Comments' ),
						path: 'comments',
						view: CommentsView,
						count: counts?.comments || undefined,
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
	page.redirect( '/subscriptions', '/subscriptions/settings' );

	page(
		/\/subscriptions(\/(comments|settings|sites))?/,
		checkFeatureFlag,
		createSubscriptions,
		makeLayout,
		render
	);
}
