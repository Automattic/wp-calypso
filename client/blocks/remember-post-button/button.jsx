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

class RememberPostButton extends React.Component {
	static propTypes = {
		isRemembered: PropTypes.bool.isRequired,
		onToggle: PropTypes.func,
		tagName: PropTypes.oneOfType( [ PropTypes.string, PropTypes.func ] ),
	};

	static defaultProps = {
		isRemembered: false,
		onToggle: noop,
		tagName: 'button',
	};

	toggle = event => {
		if ( event ) {
			event.preventDefault();
		}

		this.props.onToggle( ! this.props.isRemembered );
	};

	render() {
		const { isRemembered, translate } = this.props;
		const buttonClasses = [ 'button', 'has-icon', 'remember-post-button', this.props.className ];
		const iconSize = 20;
		const label = isRemembered ? translate( 'Forget Post' ) : translate( 'Remember Post' );

		if ( this.props.isRemembered ) {
			buttonClasses.push( 'remembered' );
		}

		const rememberedPostIcon = (
			<Gridicon key="following" icon="reader-remembered-post" size={ iconSize } />
		);
		const rememberPostIcon = (
			<Gridicon key="follow" icon="reader-remember-post" size={ iconSize } />
		);
		const labelElement = (
			<span key="label" className="remember-post-button__label">
				{ label }
			</span>
		);

		return React.createElement(
			this.props.tagName,
			{
				onClick: this.toggle,
				className: buttonClasses.join( ' ' ),
				title: label,
			},
			[ rememberedPostIcon, rememberPostIcon, labelElement ]
		);
	}
}

export default localize( RememberPostButton );
