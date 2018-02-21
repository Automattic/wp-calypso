/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import ButtonGroup from 'components/button-group';
import Button from 'components/button';

class FollowMenuButton extends React.Component {
	static propTypes = {
		following: PropTypes.bool.isRequired,
		onFollowToggle: PropTypes.func,
		iconSize: PropTypes.number,
		tagName: PropTypes.oneOfType( [ PropTypes.string, PropTypes.func ] ),
		disabled: PropTypes.bool,
		followLabel: PropTypes.string,
		followingLabel: PropTypes.string,
		compact: PropTypes.bool,
	};

	static defaultProps = {
		following: false,
		onFollowToggle: noop,
		iconSize: 20,
		tagName: 'button',
		disabled: false,
		compact: false,
	};

	componentWillMount() {
		this.strings = {
			FOLLOW: this.props.translate( 'Follow' ),
			FOLLOWING: this.props.translate( 'Following' ),
		};
	}

	toggleFollow = event => {
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
		const menuClasses = [ 'follow-menu', this.props.className ];
		const iconSize = this.props.iconSize;

		if ( this.props.following ) {
			menuClasses.push( 'is-following' );
			label = this.props.followingLabel ? this.props.followingLabel : this.strings.FOLLOWING;
		}

		if ( this.props.disabled ) {
			menuClasses.push( 'is-disabled' );
		}

		const followingIcon = (
			<Gridicon
				className="follow-menu__icon"
				key="following"
				icon="reader-following"
				size={ iconSize }
			/>
		);
		const followIcon = (
			<Gridicon className="follow-menu__icon" key="follow" icon="reader-follow" size={ iconSize } />
		);
		const followLabelElement = (
			<span key="label" className="follow-menu__label">
				{ label }
			</span>
		);

		return (
			<ButtonGroup className={ menuClasses.join( ' ' ) }>
				<Button
					compact={ this.props.compact }
					onClick={ this.toggleFollow }
					title={ label }
					className="follow-menu__button"
				>
					{ [ followingIcon, followIcon, followLabelElement ] }
				</Button>
				{ this.props.following && (
					<Button compact={ this.props.compact } className="follow-menu__button">
						<Gridicon className="follow-menu__icon" icon="chevron-down" />
					</Button>
				) }
			</ButtonGroup>
		);
	}
}

export default localize( FollowMenuButton );
