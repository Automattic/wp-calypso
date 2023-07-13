import classNames from 'classnames';
import type { ReactNode } from 'react';

import './style.scss';

export type BadgeType =
	| 'warning'
	| 'warning-clear'
	| 'success'
	| 'info'
	| 'info-blue'
	| 'info-green'
	| 'info-purple'
	| 'error';
type BadgeProps = {
	type?: BadgeType;
	className?: string;
	children?: ReactNode;
};

export default function Badge( { className, children, type = 'warning' }: BadgeProps ) {
	return <div className={ classNames( `badge badge--${ type }`, className ) }>{ children }</div>;
}
