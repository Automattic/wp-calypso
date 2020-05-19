/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

class FollowButton extends React.Component {
	static propTypes = {
		following: PropTypes.bool.isRequired,
		onFollowToggle: PropTypes.func,
		iconSize: PropTypes.number,
		tagName: PropTypes.oneOfType( [ PropTypes.string, PropTypes.func ] ),
		disabled: PropTypes.bool,
		followLabel: PropTypes.string,
		followingLabel: PropTypes.string,
	};

	static defaultProps = {
		following: false,
		onFollowToggle: noop,
		iconSize: 20,
		tagName: 'button',
		disabled: false,
	};

	UNSAFE_componentWillMount() {
		this.strings = {
			FOLLOW: this.props.translate( 'Follow' ),
			FOLLOWING: this.props.translate( 'Following' ),
		};
	}

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
		let label = this.props.followLabel ? this.props.followLabel : this.strings.FOLLOW;
		const menuClasses = [ 'button', 'follow-button', 'has-icon', this.props.className ];
		const iconSize = this.props.iconSize;

		if ( this.props.following ) {
			menuClasses.push( 'is-following' );
			label = this.props.followingLabel ? this.props.followingLabel : this.strings.FOLLOWING;
		}

		if ( this.props.disabled ) {
			menuClasses.push( 'is-disabled' );
		}

		const followingIcon = <Gridicon key="following" icon="reader-following" size={ iconSize } />;
		const followIcon = <Gridicon key="follow" icon="reader-follow" size={ iconSize } />;
		const followLabelElement = (
			<span key="label" className="follow-button__label">
				{ label }
			</span>
		);

		return React.createElement(
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
