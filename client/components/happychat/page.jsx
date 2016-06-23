import React from 'react';
import { connect } from 'react-redux';
import viewport from 'lib/viewport';
import { findDOMNode } from 'react-dom';

import { connectChat } from 'state/happychat/actions';
import { timeline, composer } from './helpers';

export const HappychatPage = React.createClass( {
	componentDidMount() {
		this.props.openChat();
	},

	onFocus() {
		const composerNode = findDOMNode( this.refs.composer );

		if ( viewport.isMobile() ) {
			/* User tapped textfield on a phone. This shows the keyboard. Unless we scroll to the bottom, the chatbox will be invisible */
			setTimeout( () => composerNode.scrollIntoView(), 500 );	/* Wait for the keyboard to appear */
		}
	},

	render() {
		const { connectionStatus } = this.props;
		return (
			<div className="happychat__container">
				{ timeline( { connectionStatus } ) }
				{ composer( { connectionStatus } ) }
			</div>
		);
	}
} );

const mapState = ( { happychat: { status: connectionStatus } } ) => ( { connectionStatus } );
const mapDispatch = dispatch => ( {
	openChat: () => dispatch( connectChat() )
} );
export default connect( mapState, mapDispatch )( HappychatPage );
