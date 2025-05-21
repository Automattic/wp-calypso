/**
 * Forked from `@wordpress/components`
 *
 * - Converted styles to CSS module.
 * - Added theme color support to `info` variant.
 */

import { info, caution, error, published } from '@wordpress/icons';
import clsx from 'clsx';
import { Icon } from '../icon';
import styles from './style.module.scss';
import type { BadgeProps } from './types';

/**
 * Returns an icon based on the badge context.
 * @returns The corresponding icon for the provided context.
 */
function contextBasedIcon( intent: BadgeProps[ 'intent' ] = 'default' ) {
	switch ( intent ) {
		case 'info':
			return info;
		case 'success':
			return published;
		case 'warning':
			return caution;
		case 'error':
			return error;
		default:
			return null;
	}
}

export function CoreBadge( {
	className,
	intent = 'default',
	children,
	...props
}: BadgeProps & React.ComponentPropsWithoutRef< 'span' > ) {
	const icon = contextBasedIcon( intent );
	const hasIcon = !! icon;

	return (
		<span
			className={ clsx( styles[ 'badge' ], className, {
				[ styles[ `is-${ intent }` ] ]: intent,
				[ styles[ 'has-icon' ] ]: hasIcon,
			} ) }
			{ ...props }
		>
			{ hasIcon && (
				<Icon icon={ icon } size={ 16 } fill="currentColor" className={ styles[ 'badge__icon' ] } />
			) }
			<span className={ styles[ 'badge__content' ] }>{ children }</span>
		</span>
	);
}
