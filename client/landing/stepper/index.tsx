import '@automattic/calypso-polyfills';
import accessibleFocus from '@automattic/accessible-focus';
import { initializeAnalytics } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import ReactDom from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { requestAllBlogsAccess } from 'wpcom-proxy-request';
import { LocaleContext } from '../gutenboarding/components/locale-context';
import { WindowLocaleEffectManager } from '../gutenboarding/components/window-locale-effect-manager';
import { setupWpDataDebug } from '../gutenboarding/devtools';
// import { exampleFlow } from './declarative-flow/example-flow';
import { builderFlow } from './declarative-flow/builder-flow';
import { FlowRenderer } from './declarative-flow/internals';
// import { siteSetupFlow } from './declarative-flow/site-setup-flow';
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
	// put the proxy iframe in "all blog access" mode
	// see https://github.com/Automattic/wp-calypso/pull/60773#discussion_r799208216
	requestAllBlogsAccess();

	setupWpDataDebug();
	// User is left undefined here because the user account will not be created
	// until after the user has completed the flow.
	// This also saves us from having to pull in lib/user/user and it's dependencies.
	initializeAnalytics( undefined, generateGetSuperProps() );
	// Add accessible-focus listener.
	accessibleFocus();

	const queryClient = new QueryClient();

	ReactDom.render(
		<LocaleContext>
			<QueryClientProvider client={ queryClient }>
				<WindowLocaleEffectManager />
				<BrowserRouter basename="stepper">
					<FlowRenderer flow={ builderFlow } />
				</BrowserRouter>
			</QueryClientProvider>
		</LocaleContext>,
		document.getElementById( 'wpcom' )
	);
};
