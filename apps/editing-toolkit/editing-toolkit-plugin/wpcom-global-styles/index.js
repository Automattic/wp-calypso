import { select, subscribe } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';
import GlobalStylesModal from './modal';

const unsubscribe = subscribe( () => {
	const currentSidebar = select( 'core/interface' ).getActiveComplementaryArea( 'core/edit-site' );
	if ( currentSidebar === 'edit-site/global-styles' ) {
		unsubscribe();
		registerPlugin( 'wpcom-global-styles', {
			render: () => <GlobalStylesModal />,
		} );
	}
} );
