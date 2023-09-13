import classNames from 'classnames';
import { memo, forwardRef, ReactNode, HTMLAttributes } from 'react';
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

const Badge = memo(
	forwardRef< HTMLDivElement, BadgeProps & HTMLAttributes< HTMLDivElement > >(
		( { className, children, type = 'warning', ...props }, ref ) => {
			return (
				<div
					ref={ ref }
					className={ classNames( `badge badge--${ type }`, className ) }
					{ ...props }
				>
					{ children }
				</div>
			);
		}
	)
);

export default Badge;
