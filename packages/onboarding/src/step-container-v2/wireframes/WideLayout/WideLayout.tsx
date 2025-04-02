import { ComponentProps } from 'react';
import { StepContainerV2 } from '../../components/StepContainerV2/StepContainerV2';

export const WideLayout = ( props: ComponentProps< typeof StepContainerV2 > ) => {
	return <StepContainerV2 width="wide" { ...props } />;
};
