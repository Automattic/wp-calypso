import clsx from 'clsx';
import * as React from 'react';

import './style.scss';

interface Props {
	align?: 'center' | 'left' | 'right';
	className?: string;
	children: React.ReactNode;
}

const Progress = ( { className, align = 'center', children, ...additionalProps }: Props ) => {
	return (
		<div
			className={ clsx( `onboarding-progress onboarding-progress__align-${ align }`, className ) }
			{ ...additionalProps }
		>
			{ children }
		</div>
	);
};

export default Progress;
