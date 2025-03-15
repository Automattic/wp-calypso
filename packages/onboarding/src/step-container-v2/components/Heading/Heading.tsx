import clsx from 'clsx';
import { ReactNode } from 'react';

import './style.scss';

interface HeadingProps {
	text: ReactNode;
	subText?: ReactNode;
	align?: 'left';
	size?: 'small';
	textBalance?: 'balance';
}

export const Heading = ( {
	text,
	subText,
	align,
	size,
	textBalance = 'balance',
}: HeadingProps ) => {
	return (
		<div
			className={ clsx( 'step-container-v2__heading', {
				left: align === 'left',
			} ) }
		>
			<h1
				className={ clsx( 'wp-brand-font', {
					small: size === 'small',
				} ) }
			>
				{ text }
			</h1>
			{ subText && (
				<p className={ clsx( { 'text-balance': textBalance === 'balance' } ) }>{ subText }</p>
			) }
		</div>
	);
};
