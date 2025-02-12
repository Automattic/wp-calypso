import clsx from 'clsx';

interface HeadingProps {
	text: string;
	subText?: string;
	align?: 'left';
	size?: 'small';
}

export const Heading = ( { text, subText, align, size }: HeadingProps ) => {
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
			{ subText && <p>{ subText }</p> }
		</div>
	);
};
