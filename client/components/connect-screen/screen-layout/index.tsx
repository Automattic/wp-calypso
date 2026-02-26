import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

export interface ScreenLayoutProps {
	children: ReactNode;
	className?: string;
	backgroundColor?: string;
	containerMaxWidth?: number | string;
}

/**
 * Full-screen centered layout for connect flows
 * @example
 * <ScreenLayout backgroundColor="#f6f7f7">
 *   <BrandHeader ... />
 *   <UserCard ... />
 *   <ActionButtons ... />
 * </ScreenLayout>
 */
export function ScreenLayout( {
	children,
	className,
	backgroundColor,
	containerMaxWidth,
}: ScreenLayoutProps ): JSX.Element {
	const style = backgroundColor ? { backgroundColor } : undefined;
	const containerStyle = containerMaxWidth ? { maxWidth: containerMaxWidth } : undefined;

	return (
		<div className={ clsx( 'connect-screen-layout', className ) } style={ style }>
			<div className="connect-screen-layout__container" style={ containerStyle }>
				{ children }
			</div>
		</div>
	);
}
