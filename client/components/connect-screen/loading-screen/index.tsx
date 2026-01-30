import { Spinner } from '@wordpress/components';
import clsx from 'clsx';

import './style.scss';

export interface LoadingScreenProps {
	message?: string;
	className?: string;
}

/**
 * Full-screen loading state with spinner and optional message
 * @example
 * <LoadingScreen message="Connecting your account..." />
 */
export function LoadingScreen( { message, className }: LoadingScreenProps ): JSX.Element {
	return (
		<div className={ clsx( 'connect-screen-loading', className ) }>
			<Spinner />
			{ message && <p className="connect-screen-loading__message">{ message }</p> }
		</div>
	);
}
