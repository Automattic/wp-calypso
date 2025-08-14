import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/classNames';
import styles from './button.module.css';

interface ButtonProps extends React.ComponentProps< 'button' > {
	variant?: 'primary' | 'ghost' | 'outline' | 'link' | 'icon';
	size?: 'sm' | 'icon';
	icon?: React.ReactNode;
	asChild?: boolean;
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
					className
				) }
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
