/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

import domReady from '@wordpress/dom-ready';
import { registerPlugin } from '@wordpress/plugins';
import GlobalStylesSidebarNotice from './global-style-sidebar-notice';
import GlobalStylesModal from './modal';
import GlobalStylesNotice from './notice';
import './store';

const showGlobalStylesComponents = () => {
	registerPlugin( 'wpcom-global-styles', {
		render: () => (
			<>
				<GlobalStylesModal />
				<GlobalStylesNotice />
				<GlobalStylesSidebarNotice />
			</>
		),
	} );
};

domReady( () => {
	showGlobalStylesComponents();
} );
