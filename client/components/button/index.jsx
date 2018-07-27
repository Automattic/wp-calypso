/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button as MaterialButton } from 'rmwc/Button';

export default class Button extends PureComponent {
	static propTypes = {
		compact: PropTypes.bool,
		primary: PropTypes.bool,
		scary: PropTypes.bool,
		busy: PropTypes.bool,
		type: PropTypes.string,
		href: PropTypes.string,
		borderless: PropTypes.bool,
		target: PropTypes.string,
		rel: PropTypes.string,
	};

	static defaultProps = {
		type: 'button',
	};

	render() {
		const className = classNames( 'button', this.props.className, {
			'is-compact': this.props.compact,
			'is-primary': this.props.primary,
			'is-scary': this.props.scary,
			'is-busy': this.props.busy,
			'is-borderless': this.props.borderless,
		} );

		const { compact, primary, scary, busy, borderless, target, rel, ...props } = this.props;

		return <MaterialButton { ...props } className={ className } />;
	}
}
