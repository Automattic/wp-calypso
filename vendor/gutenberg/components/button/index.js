/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { createElement, forwardRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';

export function Button( props, ref ) {
	const {
		href,
		target,
		isPrimary,
		isLarge,
		isSmall,
		isToggled,
		isBusy,
		isDefault,
		isLink,
		isDestructive,
		className,
		disabled,
		focus,
		...additionalProps
	} = props;

	const classes = classnames( 'components-button', className, {
		'is-button': isDefault || isPrimary || isLarge || isSmall,
		'is-default': isDefault || isLarge || isSmall,
		'is-primary': isPrimary,
		'is-large': isLarge,
		'is-small': isSmall,
		'is-toggled': isToggled,
		'is-busy': isBusy,
		'is-link': isLink,
		'is-destructive': isDestructive,
	} );

	const tag = href !== undefined && ! disabled ? 'a' : 'button';
	const tagProps = tag === 'a' ? { href, target } : { type: 'button', disabled };

	return createElement( tag, {
		...tagProps,
		...additionalProps,
		className: classes,
		autoFocus: focus,
		ref,
	} );
}

export default forwardRef( Button );
