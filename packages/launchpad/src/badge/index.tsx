import clsx from 'clsx';

import './style.scss';

export interface BadgeProps {
	type?:
		| 'warning'
		| 'warning-clear'
		| 'success'
		| 'info'
		| 'info-blue'
		| 'info-green'
		| 'info-purple'
		| 'error';
	className?: string;
	children?: React.ReactNode;
}

const Badge: React.FunctionComponent< BadgeProps > = ( props ) => {
	const className = props.className;
	const type = props.type || 'warning';
	return <div className={ clsx( `badge badge--${ type }`, className ) }>{ props.children }</div>;
};

export default Badge;
