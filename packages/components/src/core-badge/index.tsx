/**
 * Forked from `@wordpress/components`
 */

import { info, caution, error, published } from '@wordpress/icons';
import clsx from 'clsx';
import { Icon } from '../icon';
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
			className={ clsx( 'components-badge', className, {
				[ `is-${ intent }` ]: intent,
				'has-icon': hasIcon,
			} ) }
			{ ...props }
		>
			{ hasIcon && (
				<Icon icon={ icon } size={ 16 } fill="currentColor" className="components-badge__icon" />
			) }
			<span className="components-badge__content">{ children }</span>
		</span>
	);
}
