/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import config from 'config';
import HappychatButton from 'components/happychat/button';
import hasActiveHappychatSession from 'state/happychat/selectors/has-active-happychat-session';

const SidebarFooter = ( { translate, children, isHappychatButtonVisible } ) => (
	<div className="sidebar__footer">
		{ children }
		<Button className="sidebar__footer-help" borderless href="/help" title={ translate( 'Help' ) }>
			<Gridicon icon="help-outline" />
		</Button>
		{ isHappychatButtonVisible &&
		config.isEnabled( 'happychat' ) && (
			<HappychatButton className="sidebar__footer-chat" allowMobileRedirect />
		) }
	</div>
);

const mapState = state => ( { isHappychatButtonVisible: hasActiveHappychatSession( state ) } );

export default connect( mapState )( localize( SidebarFooter ) );
