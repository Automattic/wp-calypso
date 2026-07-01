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
	let product;
	let botProps = {};
	if ( helpCenterData.isCommerceGarden ) {
		product = 'commerce-garden';
		botProps = { newInteractionsBotSlug: 'ciab-workflow-support_chat' };
	} else if ( helpCenterData.isWooCommerceCom ) {
		product = 'woocommerce-com';
		// Slug injected Woo-side so Ceres can iterate the agent without a Calypso PR.
		botProps = { newInteractionsBotSlug: helpCenterData.botSlug };
	}

	return import( '@automattic/help-center' ).then( ( { default: HelpCenter } ) =>
		createRoot( container ).render(
			<QueryClientProvider client={ queryClient }>
				<HelpCenter
					locale={ helpCenterData.locale }
					sectionName={ helpCenterData.sectionName || 'gutenberg-editor' }
					currentUser={ helpCenterData.currentUser }
					site={ helpCenterData.site }
					hasPurchases={ false }
					onboardingUrl="https://wordpress.com/start"
					handleClose={ () => dispatch( 'automattic/help-center' ).setShowHelpCenter( false ) }
					product={ product }
					{ ...botProps }
				/>
			</QueryClientProvider>
		)
	);
}
