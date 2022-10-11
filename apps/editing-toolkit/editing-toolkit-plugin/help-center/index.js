import './src/config';
import { HelpCenter } from '@automattic/data-stores';
import './src/help-center';
import './src/help-center.scss';

if ( window.helpCenterAdminBar?.isLoaded ) {
	import( './src/admin-bar' );
}

HelpCenter.register();
