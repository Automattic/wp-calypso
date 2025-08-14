import { __experimentalText as WPText } from '@wordpress/components';
import clsx from 'clsx';
import { forwardRef } from 'react';
import './style.scss';

export interface TextProps extends React.ComponentProps< typeof WPText > {
	intent?: 'success' | 'warning' | 'error';
}

function UnforwardedText(
	{ intent, lineHeight, size, weight, ...props }: TextProps,
	ref: React.ForwardedRef< HTMLElement >
) {
	return (
		<WPText
			ref={ ref }
			{ ...props }
			lineHeight={ lineHeight || 'unset' }
			size={ size || 'unset' }
			weight={ weight || 'unset' }
			className={ clsx( intent && `dashboard-text--${ intent }`, props.className ) }
		/>
	);
}

export const Text = forwardRef( UnforwardedText );
