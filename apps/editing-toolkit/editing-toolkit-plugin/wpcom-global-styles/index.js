/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import domReady from '@wordpress/dom-ready';
import { registerPlugin } from '@wordpress/plugins';
import GlobalStylesModal from './modal';
import GlobalStylesNotices from './notices';
import './store';

const showGlobalStylesComponents = () => {
	registerPlugin( 'wpcom-global-styles', {
		render: () => (
			<QueryClientProvider client={ new QueryClient() }>
				<GlobalStylesModal />
				<GlobalStylesNotices />
			</QueryClientProvider>
		),
	} );
};

domReady( () => {
	showGlobalStylesComponents();
} );
