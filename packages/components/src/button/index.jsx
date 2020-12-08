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

export default class Button extends PureComponent {
	static propTypes = {
		plain: PropTypes.bool,
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
		const className = this.props.plain
			? classNames( 'button-plain', this.props.className )
			: classNames( 'button', this.props.className, {
					'is-compact': this.props.compact,
					'is-primary': this.props.primary,
					'is-scary': this.props.scary,
					'is-busy': this.props.busy,
					'is-borderless': this.props.borderless,
			  } );

		if ( this.props.href ) {
			const { compact, primary, scary, busy, borderless, plain, type, ...props } = this.props;

			// block referrers when external link
			const rel = props.target
				? ( props.rel || '' ).replace( /noopener|noreferrer/g, '' ) + ' noopener noreferrer'
				: props.rel;

			return <a { ...props } rel={ rel } className={ className } />;
		}

		const { compact, primary, scary, busy, borderless, plain, target, rel, ...props } = this.props;

		return <button { ...props } className={ className } />;
	}
}
