import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/classNames';
import styles from './button.module.css';

interface ButtonProps extends React.ComponentProps< 'button' > {
	variant?: 'primary' | 'ghost' | 'outline' | 'link' | 'icon' | 'transparent';
	size?: 'icon' | 'sm' | 'lg';
	icon?: React.ReactNode;
	asChild?: boolean;
	pressed?: boolean;
}

const Button = React.forwardRef< HTMLButtonElement, ButtonProps >(
	function Button(
		{
			className,
			variant = 'primary',
			size,
			icon,
			children,
			asChild = false,
			pressed,
			...props
		},
		ref
	) {
		const Comp = asChild ? Slot : 'button';

		const hasIcon = !! icon;

		// Auto-detect size: if icon only (no children), use 'icon' size unless explicitly overridden
		const effectiveSize =
			size || ( hasIcon && ! children ? 'icon' : undefined );

		return (
			<Comp
				ref={ ref }
				data-slot="button"
				className={ cn(
					styles.button,
					styles[ variant ],
					effectiveSize && styles[ effectiveSize ],
					hasIcon && children ? styles.withTextAndIcon : undefined,
					pressed ? styles.pressed : undefined,
					className
				) }
				// Only toggle buttons set `pressed`; omit aria-pressed otherwise
				// so momentary actions aren't announced as toggles.
				aria-pressed={ pressed }
				{ ...props }
			>
				{ icon }
				{ children }
			</Comp>
		);
	}
);

Button.displayName = 'Button';

export { Button };
