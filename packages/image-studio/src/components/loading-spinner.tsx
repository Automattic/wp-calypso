import { Spinner } from '@wordpress/components';
import type { ComponentProps } from 'react';

export interface LoadingSpinnerProps extends ComponentProps< typeof Spinner > {
	size?: number;
}

const LoadingSpinner = ( { size = 32, style, ...props }: LoadingSpinnerProps ) => (
	<Spinner
		{ ...props }
		style={ {
			height: `${ size }px`,
			width: `${ size }px`,
			...style,
		} }
	/>
);

export default LoadingSpinner;
