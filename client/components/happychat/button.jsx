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

const HappychatButton = ( { translate, onOpenChat } ) =>
	<Button compact borderless onClick={ onOpenChat }>
		<Gridicon icon="comment" /> { translate( 'Support Chat' ) }
	</Button>;

const mapStateToProps = () => ( {} );

const mapDispatchToProps = dispatch => {
	return {
		onOpenChat() {
			if ( viewport.isMobile() ) {
				// For mobile clients, happychat will always use the page compoent instead of the sidebar
				page( '/me/chat' );
				return;
			}
			dispatch( openChat() );
		}
	};
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( HappychatButton ) );
