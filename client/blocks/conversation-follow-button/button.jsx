import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { createElement, Component } from 'react';

const noop = () => {};

class ConversationFollowButton extends Component {
	static propTypes = {
		isFollowing: PropTypes.bool.isRequired,
		onFollowToggle: PropTypes.func,
		tagName: PropTypes.oneOfType( [ PropTypes.string, PropTypes.func ] ),
		followIcon: PropTypes.object,
		followingIcon: PropTypes.object,
	};

	static defaultProps = {
		isFollowing: false,
		onFollowToggle: noop,
		tagName: 'button',
		followIcon: null,
		followingIcon: null,
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

		const followingIcon = this.props.followingIcon || (
			<Gridicon key="following" icon="reader-following-conversation" size={ iconSize } />
		);
		const followIcon = this.props.followIcon || (
			<Gridicon key="follow" icon="reader-follow-conversation" size={ iconSize } />
		);
		const followLabelElement = (
			<span key="label" className="conversation-follow-button__label">
				{ label }
			</span>
		);

		return createElement(
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
