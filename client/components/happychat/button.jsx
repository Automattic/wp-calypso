/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import viewport from 'lib/viewport';
import { openChat } from 'state/ui/happychat/actions';
import Button from 'components/button';
import Gridicon from 'components/gridicon';

const HappychatButton = React.createClass( {
	onOpenChat: function() {
		const { onOpenChat } = this.props;
		if ( viewport.isMobile() ) {
			// For mobile clients, happychat will always use the page compoent instead of the sidebar
			page( '/me/chat' );
			return;
		}
		onOpenChat();
	},
	render: function() {
		const { translate } = this.props;
		return (
			<Button compact borderless onClick={ this.onOpenChat }>
				<Gridicon icon="comment" /> { translate( 'Support Chat' ) }
			</Button>
		);
	}
} );

export default connect( null, { onOpenChat: openChat } )( localize( HappychatButton ) );
