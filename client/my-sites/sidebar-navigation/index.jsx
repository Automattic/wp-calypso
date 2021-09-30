import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import SiteIcon from 'calypso/blocks/site-icon';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

function MySitesSidebarNavigation( { site } ) {
	const translate = useTranslate();
	const currentSiteTitle = site ? site.title : translate( 'All Sites' );

	return (
		<SidebarNavigation sectionTitle={ currentSiteTitle }>
			{ site && <SiteIcon site={ site } /> }
		</SidebarNavigation>
	);
}

export default connect( ( state ) => ( {
	site: getSelectedSite( state ),
} ) )( MySitesSidebarNavigation );
