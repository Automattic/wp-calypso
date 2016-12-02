/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { isOperatorsAvailable, isChatAvailable } from 'state/ui/olark/selectors';
import olarkApi from 'lib/olark-api';
import olarkActions from 'lib/olark-store/actions';
import olarkEvents from 'lib/olark-events';
import analytics from 'lib/analytics';

class OlarkChatButton extends Component {
	onChatBegin = () => {
		const { chatContext } = this.props;
		this.recordChatEvent( 'calypso_chat_button_chat_begin' );

		olarkApi( 'api.chat.sendNotificationToOperator', {
			body: `Context: ${ chatContext }`
		} );
	};

	openChat = ( event ) => {
		event.preventDefault();

		olarkActions.expandBox();
		olarkActions.focusBox();
		this.recordChatEvent( 'calypso_chat_button_click' );
	};

	componentWillMount() {
		olarkEvents.on( 'api.chat.onBeginConversation', this.onChatBegin );
	}

	componentWillUnmount() {
		olarkEvents.off( 'api.chat.onBeginConversation', this.onChatBegin );
	}

	recordChatEvent( eventAction ) {
		const { chatContext, tracksData } = this.props;
		analytics.tracks.recordEvent( eventAction, {
			...tracksData,
			chat_context: chatContext,
		} );
	}

	render() {
		const { className, isAvailable, children, borderless } = this.props;
		const classes = classnames( className, 'olark-chat-button', 'button', {
			'is-borderless': !! borderless
		} );

		if ( ! isAvailable ) {
			return null;
		}

		return (
			<button className={ classes } onClick={ this.openChat }>
				{ children }
			</button>
		);
	}
}

OlarkChatButton.defaultProps = {
	tracksData: {},
};

OlarkChatButton.propTypes = {
	chatContext: PropTypes.string.isRequired,
	tracksData: PropTypes.object,
};

export default connect( ( state, { chatContext } ) => ( {
	isAvailable: isOperatorsAvailable( state ) && isChatAvailable( state, chatContext ),
} ) )( OlarkChatButton );
