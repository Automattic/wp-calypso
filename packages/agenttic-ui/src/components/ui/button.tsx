import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/classNames';
import styles from './button.module.css';

interface ButtonProps extends React.ComponentProps< 'button' > {
	variant?:
		| 'primary'
		| 'secondary'
		| 'tertiary'
		| 'outline'
		| 'link'
		| 'icon';
	size?: 'sm' | 'xxs' | 'icon';
	iconSize?: 'sm';
	icon?: React.ReactNode;
	asChild?: boolean;
}

function Button( {
	className,
	variant = 'primary',
	size = 'sm',
	iconSize,
	icon,
	children,
	asChild = false,
	...props
}: ButtonProps ) {
	const Comp = asChild ? Slot : 'button';

	const hasIcon =
		!! icon ||
		( React.isValidElement( children ) &&
			( children.type === 'svg' ||
				( typeof children.type === 'function' &&
					children.type.name &&
					children.type.name.includes( 'Icon' ) ) ) );

	return (
		<Comp
			data-slot="button"
			className={ cn(
				styles.button,
				styles[ variant ],
				styles[ size ],
				hasIcon ? styles.buttonWithIcon : undefined,
				iconSize &&
					styles[
						`iconSize${
							iconSize.charAt( 0 ).toUpperCase() +
							iconSize.slice( 1 )
						}`
					],
				className
			) }
			{ ...props }
		>
			{ icon || children }
		</Comp>
	);
}

export { Button };
