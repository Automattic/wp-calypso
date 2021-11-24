import classnames from 'classnames';
import * as React from 'react';
import Confetti from '../confetti';

import './style.scss';

interface Props {
	animate?: boolean;
	className?: string;
}

const Hooray: React.FunctionComponent< Props > = ( {
	className,
	animate = false,
	children,
	...additionalProps
} ) => {
	return (
		<div
			className={ classnames(
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
