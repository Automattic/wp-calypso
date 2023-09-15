import classnames from 'classnames';
import React from 'react';
import './styles.scss';

interface Props {
	children: React.ReactNode;
	className?: string;
	isMonoBg?: boolean;
}

export function LayoutBlock( props: Props ) {
	const { children, className, isMonoBg } = props;

	return (
		<div className={ classnames( 'l-block', className, { 'is-mono-bg': isMonoBg } ) }>
			<div className="l-block-content">{ children }</div>
		</div>
	);
}

export function LayoutBlockSection( props: Props ) {
	const { children, className } = props;

	return <div className={ classnames( 'l-block-section', className ) }>{ children }</div>;
}
