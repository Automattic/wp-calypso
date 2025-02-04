import clsx from 'clsx';
import * as React from 'react';
import Confetti from '../confetti';

import './style.scss';

interface Props {
	animate?: boolean;
	className?: string;
	children: React.ReactNode;
}

const Hooray: React.FunctionComponent< Props > = ( {
	className,
	animate = false,
	children,
	...additionalProps
} ) => {
	return (
		<div
			className={ clsx(
				`onboarding-hooray`,
				{ 'onboarding-hooray__animate': animate },
				className
			) }
			{ ...additionalProps }
		>
			<Confetti />
			{ children }
		</div>
	);
};

export default Hooray;
