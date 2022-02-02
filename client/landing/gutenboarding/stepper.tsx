import '@automattic/calypso-polyfills';
import accessibleFocus from '@automattic/accessible-focus';
import { initializeAnalytics } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import ReactDom from 'react-dom';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { LocaleContext } from './components/locale-context';
import { WindowLocaleEffectManager } from './components/window-locale-effect-manager';
import { setupWpDataDebug } from './devtools';
import StepperOnboarding from './stepper-onboarding';
import { path } from './stepper-onboarding/path';

import 'calypso/components/environment-badge/style.scss';

function generateGetSuperProps() {
	return () => ( {
		environment: process.env.NODE_ENV,
		environment_id: config( 'env_id' ),
		site_id_label: 'wpcom',
		client: config( 'client_slug' ),
	} );
}

interface AppWindow extends Window {
	BUILD_TARGET?: string;
}

declare const window: AppWindow;

window.AppBoot = async () => {
	setupWpDataDebug();
	// User is left undefined here because the user account will not be created
	// until after the user has completed the flow.
	// This also saves us from having to pull in lib/user/user and it's dependencies.
	initializeAnalytics( undefined, generateGetSuperProps() );
	// Add accessible-focus listener.
	accessibleFocus();

	ReactDom.render(
		<LocaleContext>
			<WindowLocaleEffectManager />
			<BrowserRouter basename="stepper">
				<Switch>
					<Route exact path={ path }>
						<StepperOnboarding />
					</Route>
					<Route>
						<Redirect to="/first" />
					</Route>
				</Switch>
			</BrowserRouter>
		</LocaleContext>,
		document.getElementById( 'wpcom' )
	);
};
