import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import Gravatar from 'calypso/components/gravatar';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

import './style.scss';

function MeSidebarNavigation( { currentUser } ) {
	const translate = useTranslate();

	return (
		<SidebarNavigation sectionTitle={ translate( 'Me' ) }>
			<Gravatar user={ currentUser } size={ 30 } imgSize={ 400 } />
		</SidebarNavigation>
	);
}

export default connect( ( state ) => ( {
	currentUser: getCurrentUser( state ),
} ) )( MeSidebarNavigation );
