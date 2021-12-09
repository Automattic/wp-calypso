import classnames from 'classnames';
import * as React from 'react';

import './style.scss';

interface Props {
	align?: 'center' | 'left' | 'right';
	className?: string;
}

const Progress: React.FunctionComponent< Props > = ( {
	className,
	align = 'center',
	children,
	...additionalProps
} ) => {
	return (
		<div
			className={ classnames(
				`onboarding-progress onboarding-progress__align-${ align }`,
				className
			) }
			{ ...additionalProps }
		>
			{ children }
		</div>
	);
};

export default Progress;
