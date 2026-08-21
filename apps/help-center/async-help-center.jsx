/* global helpCenterData */
import { englishLocales } from '@automattic/i18n-utils';
import {
	ODIE_NEW_LOGGED_OUT_INTERACTIONS_BOT_SLUG,
	PLANS_PRESALES_INTRO_MESSAGE,
} from '@automattic/odie-client/src/constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { dispatch } from '@wordpress/data';
import { hasTranslation } from '@wordpress/i18n';
import { createRoot } from 'react-dom/client';

// Memoize the in-flight load so concurrent calls during a cold chunk load share one mount.
let helpCenterLoad = null;

export default function loadHelpCenter() {
	if ( document.getElementById( 'jetpack-help-center' ) ) {
		return Promise.resolve();
	}
	if ( helpCenterLoad ) {
		return helpCenterLoad;
	}
	const queryClient = new QueryClient();

	const customProps = {};

	if ( helpCenterData?.newInteractionsBotSlug ) {
		customProps.newInteractionsBotSlug = helpCenterData.newInteractionsBotSlug;
	}

	if ( helpCenterData?.newLoggedOutInteractionsBotSlug ) {
		customProps.newLoggedOutInteractionsBotSlug = helpCenterData.newLoggedOutInteractionsBotSlug;
	}

	if ( helpCenterData?.launcherContext ) {
		customProps.launcherContext = helpCenterData.launcherContext;
	}

	helpCenterLoad = import( '@automattic/help-center' ).then( ( { default: HelpCenter } ) => {
		// Only append once the chunk has loaded, so a failed import leaves no container behind and retries can mount.
		const container = document.createElement( 'div' );
		container.id = 'jetpack-help-center';
		document.body.appendChild( container );

		// Before the first render, so store resolvers already know which launcher surface this is.
		// Mirrors the UI's locale gate: an unlocalized visitor keeps the standard experience end to end.
		const presalesLocaleReady =
			englishLocales.includes( helpCenterData?.locale ) ||
			hasTranslation( PLANS_PRESALES_INTRO_MESSAGE );
		if ( customProps.launcherContext && presalesLocaleReady ) {
			dispatch( 'automattic/help-center' ).setHelpCenterOptions( {
				launcherContext: customProps.launcherContext,
				loggedOutBotSlug:
					customProps.newLoggedOutInteractionsBotSlug ?? ODIE_NEW_LOGGED_OUT_INTERACTIONS_BOT_SLUG,
			} );
		}
		return createRoot( container ).render(
			<QueryClientProvider client={ queryClient }>
				<HelpCenter
					locale={ helpCenterData.locale }
					sectionName={ helpCenterData.sectionName || 'gutenberg-editor' }
					currentUser={ helpCenterData.currentUser }
					site={ helpCenterData.site }
					hasPurchases={ false }
					onboardingUrl="https://wordpress.com/start"
					handleClose={ () => dispatch( 'automattic/help-center' ).setShowHelpCenter( false ) }
					product={ helpCenterData.isCommerceGarden ? 'commerce-garden' : undefined }
					{ ...customProps }
				/>
			</QueryClientProvider>
		);
	} );
	// Clear the memo on failure so a retry starts a fresh load.
	helpCenterLoad.catch( () => {
		helpCenterLoad = null;
	} );
	return helpCenterLoad;
}
