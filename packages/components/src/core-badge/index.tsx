/**
 * External dependencies
 */
import clsx from 'clsx';

/**
 * WordPress dependencies
 */
import { info, caution, error, published } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import type { BadgeProps } from './types';
import type { WordPressComponentProps } from '../context';
import Icon from '../icon';

/**
 * Returns an icon based on the badge context.
 *
 * @return The corresponding icon for the provided context.
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

function Badge( {
	className,
	intent = 'default',
	children,
	...props
}: WordPressComponentProps< BadgeProps, 'span', false > ) {
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

export default Badge;
