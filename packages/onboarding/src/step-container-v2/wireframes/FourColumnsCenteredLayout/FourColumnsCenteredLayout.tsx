import clsx from 'clsx';
import { ComponentProps } from 'react';
import { StepContainerV2 } from '../../components/StepContainerV2/StepContainerV2';

import './style.scss';

export const FourColumnsCenteredLayout = ( props: ComponentProps< typeof StepContainerV2 > ) => {
	return (
		<StepContainerV2
			{ ...props }
			className={ clsx(
				'step-container-v2__content--four-columns-centered-layout',
				props.className
			) }
		/>
	);
};
