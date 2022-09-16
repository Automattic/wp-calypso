/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

import { dispatch, select, subscribe } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';
import GlobalStylesModal from './modal';

const unsubscribe = subscribe( () => {
	const currentSidebar = select( 'core/interface' ).getActiveComplementaryArea( 'core/edit-site' );
	if ( currentSidebar === 'edit-site/global-styles' ) {
		unsubscribe();

		// Hide the welcome guide modal, so it doesn't conflict with our modal.
		dispatch( 'core/preferences' ).set( 'core/edit-site', 'welcomeGuideStyles', false );

		registerPlugin( 'wpcom-global-styles', {
			render: () => <GlobalStylesModal />,
		} );
	}
} );
