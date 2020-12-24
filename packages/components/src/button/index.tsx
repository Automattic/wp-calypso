/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

type Props = {
	className?: string;
	plain?: boolean;
	compact?: boolean;
	primary?: boolean;
	scary?: boolean;
	busy?: boolean;
	type?: JSX.IntrinsicElements[ 'button' ][ 'type' ];
	href?: string;
	borderless?: boolean;
	target?: string;
	rel?: string;
};

export default class Button extends PureComponent< Props > {
	static defaultProps = {
		type: 'button',
	};

	render(): JSX.Element {
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
