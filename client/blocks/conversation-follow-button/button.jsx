/**
 */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

class ConversationFollowButton extends React.Component {
	static propTypes = {
		isFollowing: PropTypes.bool.isRequired,
		onFollowToggle: PropTypes.func,
		tagName: PropTypes.oneOfType( [ PropTypes.string, PropTypes.func ] ),
	};

	static defaultProps = {
		isFollowing: false,
		onFollowToggle: noop,
		tagName: 'button',
	};

	toggleFollow = ( event ) => {
		if ( event ) {
			event.preventDefault();
		}

		this.props.onFollowToggle( ! this.props.isFollowing );
	};

	render() {
		const { isFollowing, translate } = this.props;
		const buttonClasses = [
			'button',
			'has-icon',
			'conversation-follow-button',
			this.props.className,
		];
		const iconSize = 20;
		const label = isFollowing
			? translate( 'Following conversation' )
			: translate( 'Follow conversation' );

		if ( this.props.isFollowing ) {
			buttonClasses.push( 'is-following' );
		}

		const followingIcon = (
			<Gridicon key="following" icon="reader-following-conversation" size={ iconSize } />
		);
		const followIcon = (
			<Gridicon key="follow" icon="reader-follow-conversation" size={ iconSize } />
		);
		const followLabelElement = (
			<span key="label" className="conversation-follow-button__label">
				{ label }
			</span>
		);

		return React.createElement(
			this.props.tagName,
			{
				onClick: this.toggleFollow,
				className: buttonClasses.join( ' ' ),
				title: label,
			},
			[ followingIcon, followIcon, followLabelElement ]
		);
	}
}

export default localize( ConversationFollowButton );
