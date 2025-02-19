import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { createElement, Component } from 'react';

import './style.scss';

const noop = () => {};

class FollowButton extends Component {
	static propTypes = {
		following: PropTypes.bool.isRequired,
		onFollowToggle: PropTypes.func,
		iconSize: PropTypes.number,
		tagName: PropTypes.oneOfType( [ PropTypes.string, PropTypes.func ] ),
		disabled: PropTypes.bool,
		followLabel: PropTypes.string,
		followingLabel: PropTypes.string,
		followIcon: PropTypes.object,
		followingIcon: PropTypes.object,
		hasButtonStyle: PropTypes.bool,
	};

	static defaultProps = {
		following: false,
		onFollowToggle: noop,
		iconSize: 20,
		tagName: 'button',
		disabled: false,
	};

	toggleFollow = ( event ) => {
		if ( event ) {
			event.preventDefault();
		}

		if ( this.props.disabled ) {
			return;
		}

		if ( this.props.onFollowToggle ) {
			this.props.onFollowToggle( ! this.props.following );
		}
	};

	render() {
		let label = this.props.followLabel
			? this.props.followLabel
			: this.props.translate( 'Subscribe' );
		const menuClasses = [ 'button', 'follow-button', 'has-icon', this.props.className ];
		const iconSize = this.props.iconSize;

		if ( this.props.following ) {
			menuClasses.push( 'is-following' );
			label = this.props.followingLabel
				? this.props.followingLabel
				: this.props.translate( 'Subscribed' );
		}

		if ( this.props.disabled ) {
			menuClasses.push( 'is-disabled' );
		}

		if ( this.props.hasButtonStyle ) {
			menuClasses.push( 'has-button-style' );
		}

		const followingIcon = this.props.followingIcon || (
			<Gridicon key="following" icon="reader-following" size={ iconSize } />
		);
		const followIcon = this.props.followIcon || (
			<Gridicon key="follow" icon="reader-follow" size={ iconSize } />
		);
		const followLabelElement = (
			<span key="label" className="follow-button__label">
				{ label }
			</span>
		);

		return createElement(
			this.props.tagName,
			{
				onClick: this.toggleFollow,
				className: menuClasses.join( ' ' ),
				title: label,
			},
			[ followingIcon, followIcon, followLabelElement ]
		);
	}
}

export default localize( FollowButton );
