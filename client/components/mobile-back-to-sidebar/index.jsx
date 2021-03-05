/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal Dependencies
 */
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import isNavUnificationEnabled from 'calypso/state/selectors/is-nav-unification-enabled';

/**
 * Style dependencies
 */
import './style.scss';

function MobileBackToSidebar( {
	children,
	toggleSidebar,
	isNavUnificationEnabled: isUnifiedNavEnabled,
} ) {
	if ( isUnifiedNavEnabled ) {
		return null;
	}

	return (
		<button className="mobile-back-to-sidebar" onClick={ toggleSidebar }>
			<Gridicon icon="chevron-left" className="mobile-back-to-sidebar__icon" />
			<span className="mobile-back-to-sidebar__content">{ children }</span>
		</button>
	);
}

export default connect(
	( state ) => ( {
		isNavUnificationEnabled: isNavUnificationEnabled( state ),
	} ),
	{ toggleSidebar: () => setLayoutFocus( 'sidebar' ) }
)( MobileBackToSidebar );
