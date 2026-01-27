import { Spinner } from '@wordpress/components';
import clsx from 'clsx';
import type { LoadingScreenProps } from './types';

import './style.scss';

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
