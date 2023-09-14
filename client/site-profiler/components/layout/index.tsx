import classnames from 'classnames';
import React from 'react';
import './styles.scss';

interface Props {
	children: React.ReactNode;
	className?: string;
}

export function LayoutBlock( props: Props ) {
	const { children, className } = props;

	return <div className={ classnames( 'l-block', className ) }>{ children }</div>;
}

export function LayoutBlockSection( props: Props ) {
	const { children, className } = props;

	return <div className={ classnames( 'l-block-section', className ) }>{ children }</div>;
}
