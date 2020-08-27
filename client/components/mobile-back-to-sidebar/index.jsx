/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';

/**
 * Internal Dependencies
 */
import { Button } from '@automattic/components';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';

/**
 * Style dependencies
 */
import './style.scss';

function MobileBackToSidebar( { children, toggleSidebar } ) {
	return (
		<Button className="mobile-back-to-sidebar" onClick={ toggleSidebar }>
			<Gridicon icon="chevron-left" className="mobile-back-to-sidebar__icon" />
			<span className="mobile-back-to-sidebar__content">{ children }</span>
		</Button>
	);
}

export default connect( null, { toggleSidebar: () => setLayoutFocus( 'sidebar' ) } )(
	MobileBackToSidebar
);
