import clsx from 'clsx';
import { ComponentProps } from 'react';
import { StepContainerV2 } from '../../step-container-v2';

import './style.scss';

type CenteredStepLayoutProps = Omit<
	ComponentProps< typeof StepContainerV2 >,
	'heading' | 'render'
> & {
	heading?: Omit<
		NonNullable< ComponentProps< typeof StepContainerV2 >[ 'heading' ] >,
		'customPlacement'
	>;
	render: ComponentProps< typeof StepContainerV2 >[ 'render' ];
};

export const CenteredStepLayout = ( { heading, render, ...props }: CenteredStepLayoutProps ) => {
	return (
		<StepContainerV2
			{ ...props }
			className={ clsx( 'centered-step-layout', props.className ) }
			heading={ heading && { ...heading, customPlacement: false } }
			render={ render }
		/>
	);
};
