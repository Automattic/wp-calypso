import clsx from 'clsx';
import { ReactNode } from 'react';

import './style.scss';

interface HeadingProps {
	text: ReactNode;
	subText?: ReactNode;
	align?: 'left' | 'center';
	size?: 'small';
}

export const Heading = ( { text, subText, align, size }: HeadingProps ) => {
	return (
		<div
			className={ clsx( 'step-container-v2__heading', {
				left: align === 'left',
				center: align === 'center',
			} ) }
		>
			<h1
				className={ clsx( 'wp-brand-font', {
					small: size === 'small',
				} ) }
			>
				{ text }
			</h1>
			{ subText && <p>{ subText }</p> }
		</div>
	);
};
