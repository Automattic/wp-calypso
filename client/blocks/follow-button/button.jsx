import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { createElement, createRef, Component } from 'react';
import Tooltip from 'calypso/components/tooltip';

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

	buttonRef = createRef();
	state = { tooltip: false };

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
		let label = this.props.followLabel ? this.props.followLabel : this.props.translate( 'Follow' );
		const menuClasses = [ 'button', 'follow-button', 'has-icon', this.props.className ];
		const iconSize = this.props.iconSize;

		if ( this.props.following ) {
			menuClasses.push( 'is-following' );
			label = this.props.followingLabel
				? this.props.followingLabel
				: this.props.translate( 'Following' );
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

		const tooltipElement = (
			<Tooltip
				isVisible={ this.state.tooltip }
				position="bottom"
				context={ this.buttonRef.current }
			>
				{ label }
			</Tooltip>
		);

		return createElement(
			this.props.tagName,
			{
				onClick: this.toggleFollow,
				onMouseEnter: () => {
					this.setState( { tooltip: true } );
				},
				onMouseLeave: () => {
					this.setState( { tooltip: false } );
				},
				ref: this.buttonRef,
				className: menuClasses.join( ' ' ),
			},
			[ followingIcon, followIcon, followLabelElement, tooltipElement ]
		);
	}
}

export default localize( FollowButton );
