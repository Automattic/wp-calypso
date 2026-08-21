/* global helpCenterData */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { dispatch } from '@wordpress/data';
import { createRoot } from 'react-dom/client';

export default function loadHelpCenter() {
	if ( document.getElementById( 'jetpack-help-center' ) ) {
		return Promise.resolve();
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

	return import( '@automattic/help-center' ).then( ( { default: HelpCenter } ) => {
		// Only append once the chunk has loaded, so a failed import leaves no container behind and retries can mount.
		const container = document.createElement( 'div' );
		container.id = 'jetpack-help-center';
		document.body.appendChild( container );

		// Before the first render, so store resolvers (e.g. the logged-out
		// auto-open route) already know which launcher surface this is.
		if ( customProps.launcherContext ) {
			dispatch( 'automattic/help-center' ).setHelpCenterOptions( {
				launcherContext: customProps.launcherContext,
				loggedOutBotSlug: customProps.newLoggedOutInteractionsBotSlug,
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
}
