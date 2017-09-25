/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import HappychatButton from 'components/happychat/button';
import config from 'config';
import { hasActiveHappychatSession } from 'state/happychat/selectors';

const SidebarFooter = ( { translate, children, isHappychatButtonVisible } ) => (
	<div className="sidebar__footer">
		{ children }
		<Button
			className="sidebar__footer-help"
			borderless
			href="/help"
			title={ translate( 'Help' ) }>
			<Gridicon icon="help-outline" />
		</Button>
		{
			isHappychatButtonVisible &&
			config.isEnabled( 'happychat' ) &&
			<HappychatButton className="sidebar__footer-chat" allowMobileRedirect />
		}
	</div>
);

const mapState = ( state ) => ( { isHappychatButtonVisible: hasActiveHappychatSession( state ) } );

export default connect( mapState )( localize( SidebarFooter ) );
