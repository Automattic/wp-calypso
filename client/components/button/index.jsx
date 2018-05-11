/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

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

		if ( this.props.href ) {
			// eslint-disable-next-line no-unused-vars
			const { compact, primary, scary, busy, borderless, type, ...props } = this.props;

			// block referrers when external link
			const rel = props.target
				? ( props.rel || '' ).replace( /noopener|noreferer/g, '' ) + ' noopener noreferer'
				: props.rel;

			return <a { ...props } rel={ rel } className={ className } />;
		}

		// eslint-disable-next-line no-unused-vars
		const { compact, primary, scary, busy, borderless, target, rel, ...props } = this.props;

		return <button { ...props } className={ className } />;
	}
}
