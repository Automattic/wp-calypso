import clsx from 'clsx';
import React from 'react';
import './styles.scss';

interface Props {
	children: React.ReactNode;
	className?: string;
	width?: 'medium' | 'small';
	isMonoBg?: boolean;
	animate?: boolean;
}

export function LayoutBlock( props: Props ) {
	const { children, className, width, isMonoBg, animate = true } = props;

	return (
		<div
			className={ clsx( 'l-block', className, {
				'is-mono-bg': isMonoBg,
				'width-small': width === 'small',
				'width-medium': width === 'medium',
				animate: animate,
			} ) }
		>
			<div className="l-block-wrapper">{ children }</div>
		</div>
	);
}

export function LayoutBlockSection( props: Props ) {
	const { children, className } = props;

	return <div className={ clsx( 'l-block-section', className ) }>{ children }</div>;
}
