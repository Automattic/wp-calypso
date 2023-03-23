import config from '@automattic/calypso-config';
import { Reader } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import SubscriptionManager from '@automattic/subscription-manager';
import { useTranslate } from 'i18n-calypso';
import page, { Callback } from 'page';
import { createElement } from 'react';
import MomentProvider from 'calypso/components/localized-moment/provider';
import { makeLayout, render } from 'calypso/controller';

const SitesView = () => <span>Sites View</span>;
const CommentsView = () => <span>Comments View</span>;

const SubscriptionManagementPage = () => {
	const translate = useTranslate();
	const { data: counts } = Reader.useSubscriptionManagerSubscriptionsCountQuery();
	const locale = useLocale();

	const SettingsView = () => {
		const {
			data: settings,
			isLoading,
			isFetched,
		} = Reader.useSubscriptionManagerUserSettingsQuery();
		return (
			<SubscriptionManager.UserSettings loading={ ! isLoading && ! isFetched } value={ settings } />
		);
	};

	return (
		<MomentProvider currentLocale={ locale }>
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
		</MomentProvider>
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
