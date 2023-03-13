import '@automattic/calypso-polyfills';
import SubscriptionManager from '@automattic/subscription-manager';
import ReactDom from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import 'calypso/components/environment-badge/style.scss';

declare const window: AppWindow;

interface AppWindow extends Window {
	BUILD_TARGET?: string;
}

const SiteSubscriptions = () => 'SiteSubscriptions';
const SubscriptionSettings = () => 'Settings for a specific subscription';

window.AppBoot = async () => {
	ReactDom.render(
		<BrowserRouter basename="subscriptions">
			<SubscriptionManager />
			<Switch>
				<Route path="/sites" render={ SiteSubscriptions } />
				<Route path="/settings" render={ SubscriptionSettings } />
			</Switch>
		</BrowserRouter>,
		document.getElementById( 'wpcom' )
	);
};
