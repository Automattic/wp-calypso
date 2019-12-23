/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

const Button = ( { type = 'button', compact, primary, scary, busy, borderless, ...props } ) => {
	const className = classNames( 'button', props.className, {
		'is-compact': compact,
		'is-primary': primary,
		'is-scary': scary,
		'is-busy': busy,
		'is-borderless': borderless,
	} );

	if ( props.href ) {
		// block referrers when external link
		const rel = props.target
			? ( props.rel || '' ).replace( /noopener|noreferrer/g, '' ) + ' noopener noreferrer'
			: props.rel;

		return <a { ...props } rel={ rel } className={ className } />;
	}

	const { target, rel, ...buttonProps } = props;

	return <button { ...buttonProps } type={ type } className={ className } />;
};

export default Button;
