/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { HappychatConnection } from './connection';
import { Title } from './title';
import { Composer } from './composer';
import { Notices } from './notices';
import { Timeline } from './timeline';

/*
 * Main chat UI component
 */
export class Happychat extends React.Component {
	componentDidMount() {
		this.props.onFocused();
	}

	componentWillUnmount() {
		this.props.onBlurred();
	}

	render() {
		const {
			chatStatus,
			connectionStatus,
			currentUserEmail,
			disabled,
			getAuth,
			isChatOpen,
			isConnectionUninitialized,
			isCurrentUser,
			isHappychatEnabled,
			isMinimizing,
			isServerReachable,
			message,
			onCloseChat,
			onInitConnection,
			onMinimizeChat,
			onMinimizedChat,
			onSendMessage,
			onSendNotTyping,
			onSendTyping,
			onSetCurrentMessage,
			timeline,
			translate,
		} = this.props;

		return (
			<div className="happychat">
				<HappychatConnection
					getAuth={ getAuth }
					onInitConnection={ onInitConnection }
					isHappychatEnabled={ isHappychatEnabled }
					isConnectionUninitialized={ isConnectionUninitialized }
				/>
				<div
					className={ classnames( 'happychat__container', {
						'is-open': isChatOpen,
						'is-minimizing': isMinimizing,
					} ) }
				>
					<Title
						onCloseChat={ onCloseChat }
						onMinimizeChat={ onMinimizeChat }
						onMinimizedChat={ onMinimizedChat }
						translate={ translate }
					/>
					<Timeline
						currentUserEmail={ currentUserEmail }
						isCurrentUser={ isCurrentUser }
						timeline={ timeline }
						translate={ translate }
					/>
					<Notices
						chatStatus={ chatStatus }
						connectionStatus={ connectionStatus }
						isServerReachable={ isServerReachable }
						translate={ translate }
					/>
					<Composer
						disabled={ disabled }
						message={ message }
						onSendMessage={ onSendMessage }
						onSendNotTyping={ onSendNotTyping }
						onSendTyping={ onSendTyping }
						onSetCurrentMessage={ onSetCurrentMessage }
						translate={ translate }
					/>
				</div>
			</div>
		);
	}
}

Happychat.propTypes = {
	chatStatus: PropTypes.string,
	connectionStatus: PropTypes.string,
	currentUserEmail: PropTypes.string,
	disabled: PropTypes.bool,
	getAuth: PropTypes.func,
	isChatOpen: PropTypes.bool,
	isConnectionUninitialized: PropTypes.bool,
	isCurrentUser: PropTypes.func,
	isHappychatEnabled: PropTypes.bool,
	isMinimizing: PropTypes.bool,
	isServerReachable: PropTypes.bool,
	message: PropTypes.string,
	onBlurred: PropTypes.func,
	onCloseChat: PropTypes.func,
	onFocused: PropTypes.func,
	onInitConnection: PropTypes.func,
	onMinimizeChat: PropTypes.func,
	onMinimizedChat: PropTypes.func,
	onSendMessage: PropTypes.func,
	onSendNotTyping: PropTypes.func,
	onSendTyping: PropTypes.func,
	onSetCurrentMessage: PropTypes.func,
	timeline: PropTypes.array,
	translate: PropTypes.func,
};
