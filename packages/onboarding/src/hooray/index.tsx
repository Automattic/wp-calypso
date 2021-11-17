import { Confetti } from '@automattic/launch';
import classnames from 'classnames';
import * as React from 'react';

import './style.scss';

interface Props {
	animate?: boolean;
	className?: string;
}

const Hooray: React.FunctionComponent< Props > = ( {
	className,
	animate = true,
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
