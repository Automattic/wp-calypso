import config from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TranslatableString from 'calypso/components/translatable/proptype';
import isNavUnificationEnabled from 'calypso/state/selectors/is-nav-unification-enabled';
import isWooSiteSelector from 'calypso/state/selectors/is-woo-site';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';

import './style.scss';

function SidebarNavigation( {
	sectionTitle,
	children = undefined,
	toggleSidebar,
	isWooSite,
	isNavUnificationEnabled: isUnifiedNavEnabled,
} ) {
	if ( isWooSite ) {
		return null;
	}

	if ( isUnifiedNavEnabled && ! config.isEnabled( 'jetpack-cloud' ) ) {
		return null;
	}

	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<header className="current-section">
			<button onClick={ toggleSidebar }>
				<Gridicon icon="menu" />
				{ children }
				<h1 className="current-section__site-title">{ sectionTitle }</h1>
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
		isNavUnificationEnabled: isNavUnificationEnabled( state ),
		isWooSite: isWooSiteSelector( state ),
	} ),
	{
		toggleSidebar: () => setLayoutFocus( 'sidebar' ),
	}
)( SidebarNavigation );
