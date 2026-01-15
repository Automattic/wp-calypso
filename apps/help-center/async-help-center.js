/* global helpCenterData */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { dispatch } from '@wordpress/data';
import { createRoot } from 'react-dom/client';

export default function loadHelpCenter() {
	if ( document.getElementById( 'jetpack-help-center' ) ) {
		return Promise.resolve();
	}
	const queryClient = new QueryClient();
	const container = document.createElement( 'div' );
	container.id = 'jetpack-help-center';
	document.body.appendChild( container );
	const botProps = helpCenterData.isCommerceGarden
		? { newInteractionsBotSlug: 'ciab-workflow-support_chat' }
		: {};

	return import( '@automattic/help-center' ).then( ( { default: HelpCenter } ) =>
		createRoot( container ).render(
			<QueryClientProvider client={ queryClient }>
				<HelpCenter
					locale={ helpCenterData.locale }
					sectionName={ helpCenterData.sectionName || 'gutenberg-editor' }
					currentUser={ helpCenterData.currentUser }
					site={ helpCenterData.site }
					source={ helpCenterData.isCommerceGarden ? 'commerce-garden' : null }
					hasPurchases={ false }
					onboardingUrl="https://wordpress.com/start"
					handleClose={ () => dispatch( 'automattic/help-center' ).setShowHelpCenter( false ) }
					isCommerceGarden={ helpCenterData.isCommerceGarden }
					{ ...botProps }
				/>
			</QueryClientProvider>
		)
	);
}
