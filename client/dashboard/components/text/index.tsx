import { __experimentalText as WPText } from '@wordpress/components';
import clsx from 'clsx';
import { forwardRef } from 'react';
import './style.scss';

export interface TextProps extends React.ComponentProps< typeof WPText > {
	intent?: 'success' | 'warning' | 'error';
}

function UnforwardedText(
	{ intent, ...props }: TextProps,
	ref: React.ForwardedRef< HTMLElement >
) {
	return (
		<WPText
			ref={ ref }
			{ ...props }
			className={ clsx(
				{
					'dashboard-text--success': intent === 'success',
					'dashboard-text--warning': intent === 'warning',
					'dashboard-text--error': intent === 'error',
				},
				props.className
			) }
			variant={ intent ? undefined : ( 'muted' as const ) }
		/>
	);
}

export const Text = forwardRef( UnforwardedText );
