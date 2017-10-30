/**
 * @format
 */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

class ConversationFollowButton extends React.Component {
	static propTypes = {
		following: PropTypes.bool.isRequired,
		onFollowToggle: PropTypes.func,
	};

	static defaultProps = {
		following: false,
		onFollowToggle: noop,
	};

	toggleFollow = event => {
		if ( event ) {
			event.preventDefault();
		}

		if ( this.props.onFollowToggle ) {
			this.props.onFollowToggle( ! this.props.following );
		}
	};

	render() {
		const classes = [ 'conversation-follow-button', this.props.className ];
		const iconSize = 20;
		let label = this.props.translate( 'Follow Conversation' );

		if ( this.props.following ) {
			classes.push( 'is-following' );
			label = this.props.translate( 'Following Conversation' );
		}

		const followingIcon = (
				<Gridicon key="following" icon="reader-following-conversation" size={ iconSize } />
			),
			followIcon = <Gridicon key="follow" icon="reader-follow-conversation" size={ iconSize } />,
			followLabelElement = (
				<span key="label" className="conversation-follow-button__label">
					{ label }
				</span>
			);

		return React.createElement(
			'button',
			{
				onClick: this.toggleFollow,
				className: classes.join( ' ' ),
				title: label,
			},
			[ followingIcon, followIcon, followLabelElement ]
		);
	}
}

export default localize( ConversationFollowButton );
