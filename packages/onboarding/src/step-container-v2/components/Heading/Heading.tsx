import clsx from 'clsx';
import { ReactNode } from 'react';
import styles from './style.module.scss';

interface HeadingProps {
	text: ReactNode;
	subText?: ReactNode;
	align?: 'left' | 'center';
	size?: 'small';
}

export const Heading = ( { text, subText, align, size }: HeadingProps ) => {
	return (
		<div
			className={ clsx( styles[ 'step-container-v2__heading' ], {
				[ styles.left ]: align === 'left',
				[ styles.center ]: align === 'center',
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
