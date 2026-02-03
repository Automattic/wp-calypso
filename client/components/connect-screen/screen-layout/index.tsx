import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

export interface ScreenLayoutProps {
	children: ReactNode;
	className?: string;
	backgroundColor?: string;
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
}: ScreenLayoutProps ): JSX.Element {
	const style = backgroundColor ? { backgroundColor } : undefined;

	return (
		<div className={ clsx( 'connect-screen-layout', className ) } style={ style }>
			<div className="connect-screen-layout__container">{ children }</div>
		</div>
	);
}
