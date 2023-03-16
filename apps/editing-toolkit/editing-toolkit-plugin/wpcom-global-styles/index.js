/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

import domReady from '@wordpress/dom-ready';
import { registerPlugin } from '@wordpress/plugins';
import GlobalStylesModal from './modal';
import GlobalStylesNotice from './notice';
import './store';
import { GlobalStylesScreenRootNotice } from './screen-root-notice';

const showGlobalStylesComponents = () => {
	registerPlugin( 'wpcom-global-styles', {
		render: () => (
			<>
				<GlobalStylesModal />
				<GlobalStylesNotice />
				<GlobalStylesScreenRootNotice />
			</>
		),
	} );
};

domReady( () => {
	showGlobalStylesComponents();
} );
