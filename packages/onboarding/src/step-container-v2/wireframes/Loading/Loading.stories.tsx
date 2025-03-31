import { withStepContainerV2ContextDecorator } from '../../helpers/withStepContainerV2ContextDecorator';
import { Loading } from './Loading';
import type { Meta } from '@storybook/react';

const meta: Meta< typeof Loading > = {
	title: 'Onboarding/StepWireframes/Loading',
	component: Loading,
	decorators: [ withStepContainerV2ContextDecorator ],
};

export default meta;

export const Default = () => {
	return <Loading title="Loading" progress={ 0.5 } />;
};
