import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TranslatableString from 'calypso/components/translatable/proptype';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

function SidebarNavigation( { sectionTitle, site, toggleSidebar } ) {
	const translate = useTranslate();

	const siteTitle = site?.title ?? translate( 'All Sites' );

	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<header className="current-section">
			<button onClick={ toggleSidebar }>
				<Gridicon icon="menu" />
				<h1 className="current-section__site-title">{ sectionTitle ?? siteTitle }</h1>
			</button>
		</header>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
}

SidebarNavigation.propTypes = {
	sectionTitle: TranslatableString,
	toggleSidebar: PropTypes.func.isRequired,
};

export default connect(
	( state ) => ( {
		site: getSelectedSite( state ),
	} ),
	{
		toggleSidebar: () => setLayoutFocus( 'sidebar' ),
	}
)( SidebarNavigation );
