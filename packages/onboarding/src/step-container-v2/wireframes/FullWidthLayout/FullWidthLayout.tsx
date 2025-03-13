import { ComponentProps } from 'react';
import { StepContainerV2 } from '../../components/StepContainerV2/StepContainerV2';

export const FullWidthLayout = ( props: ComponentProps< typeof StepContainerV2 > ) => {
	return <StepContainerV2 width="full" { ...props } />;
};
