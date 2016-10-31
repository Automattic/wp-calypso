/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import Button from 'components/button';
import config from 'config';
import HappychatButton from 'components/happychat/button';
import { isHappychatAvailable } from 'state/happychat/selectors';

const SidebarFooter = ( { translate, children, isHappychatAvailable } ) => (
	<div className="sidebar__footer">
		{ children }
		<Button className="sidebar__footer-help" borderless href="/help" title={ translate( 'Help' ) }>
			<Gridicon icon="help-outline" />
		</Button>
		{ isHappychatAvailable && config.isEnabled( 'happychat' ) && <HappychatButton /> }
	</div>
);

const mapState = ( state ) => ( { isHappychatAvailable: isHappychatAvailable( state ) } );

export default connect( mapState )( localize( SidebarFooter ) );
