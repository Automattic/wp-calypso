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

export const Indeterminate = () => {
	return <Loading title="Loading" progress={ undefined } />;
};

export const NoTitle = () => {
	return <Loading progress={ undefined } />;
};

export const DelayedTitle = () => {
	return <Loading title="Reticulating splines" progress={ undefined } delay={ 2000 } />;
};
