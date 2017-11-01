/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import GridIcon from 'gridicons';

/*
 * React component for rendering title bar
 */
export class Title extends React.Component {
	// transform-class-properties syntax so this is bound within the function
	onCloseChat = () => {
		const { onCloseChat, onMinimizeChat, onMinimizedChat } = this.props;
		onMinimizeChat();
		setTimeout( () => {
			onMinimizedChat();
			onCloseChat();
		}, 500 );
	};

	render() {
		const { translate } = this.props;
		return (
			<div className="happychat__title">
				<div className="happychat__active-toolbar">
					<h4>{ translate( 'Support Chat' ) }</h4>
					<div onClick={ this.onCloseChat }>
						<GridIcon icon="cross" />
					</div>
				</div>
			</div>
		);
	}
}

Title.propTypes = {
	onCloseChat: PropTypes.func,
	onMinimizeChat: PropTypes.func,
	onMinimizedChat: PropTypes.func,
	translate: PropTypes.func,
};
