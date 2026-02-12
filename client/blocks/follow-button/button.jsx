import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { createElement, Component } from 'react';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';

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
		isButtonOnly: PropTypes.bool,
	};

	static defaultProps = {
		following: false,
		onFollowToggle: noop,
		iconSize: 20,
		tagName: 'button',
		disabled: false,
		isButtonOnly: false,
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
			menuClasses.push( 'tooltip' );
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

		const followingIcon = this.props.followingIcon || ReaderFollowingFeedIcon( { iconSize } );
		const followIcon = this.props.followIcon || ReaderFollowFeedIcon( { iconSize } );
		const followLabelElement = ! this.props.isButtonOnly && (
			<span key="label" className="follow-button__label">
				{ label }
			</span>
		);

		const attributes = {
			onClick: this.toggleFollow,
			className: menuClasses.join( ' ' ),
			'aria-label': this.props.following
				? this.props.translate( 'Unsubscribe' )
				: this.props.translate( 'Subscribe' ),
		};

		if ( this.props.following ) {
			attributes[ 'data-tooltip' ] = this.props.translate( 'Unsubscribe' );
		}

		return createElement( this.props.tagName, attributes, [
			followingIcon,
			followIcon,
			followLabelElement,
		] );
	}
}

export default localize( FollowButton );
