/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal Dependencies
 */
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import TranslatableString from 'calypso/components/translatable/proptype';
import config from '@automattic/calypso-config';
import isNavUnificationEnabled from 'calypso/state/selectors/is-nav-unification-enabled';

/**
 * Style dependencies
 */
import './style.scss';

function SidebarNavigation( {
	sectionTitle,
	children,
	toggleSidebar,
	isNavUnificationEnabled: isUnifiedNavEnabled,
} ) {
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
	} ),
	{
		toggleSidebar: () => setLayoutFocus( 'sidebar' ),
	}
)( SidebarNavigation );
