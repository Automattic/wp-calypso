/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
/**
 * Style dependencies
 */
import './style.scss';

export default class StripeConnectButton extends PureComponent {
	static propTypes = {
		href: PropTypes.string,
		target: PropTypes.string,
		rel: PropTypes.string,
		className: PropTypes.string,
	};

	render() {
		const className = classNames( 'stripe-connect', this.props.className );

		// block referrers when external link
		const rel = this.props.target
			? ( this.props.rel || '' ).replace( /noopener|noreferrer/g, '' ) + ' noopener noreferrer'
			: this.props.rel;

		return (
			<a { ...this.props } rel={ rel } className={ className }>
				<span>{ this.props.children }</span>
			</a>
		);
	}
}
