import '@automattic/calypso-polyfills';
import accessibleFocus from '@automattic/accessible-focus';
import { initializeAnalytics } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import ReactDom from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { LocaleContext } from '../gutenboarding/components/locale-context';
import { WindowLocaleEffectManager } from '../gutenboarding/components/window-locale-effect-manager';
import { setupWpDataDebug } from '../gutenboarding/devtools';
import { exampleFlow } from './declarative-flow/example-flow';
import { FlowRenderer } from './declarative-flow/internals';
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
				<FlowRenderer flow={ exampleFlow } />
			</BrowserRouter>
		</LocaleContext>,
		document.getElementById( 'wpcom' )
	);
};
