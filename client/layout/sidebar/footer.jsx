/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import Button from 'components/button';
import config from 'config';
import HappychatButton from 'components/happychat/button';

const SidebarFooter = ( { translate, children } ) => (
	<div className="sidebar__footer">
		{ children }
		<Button compact borderless href="/help">
			<Gridicon icon="help-outline" /> { translate( 'Help' ) }
		</Button>
		{ config.isEnabled( 'happychat' ) && <HappychatButton /> }
	</div>
);

export default localize( SidebarFooter );
