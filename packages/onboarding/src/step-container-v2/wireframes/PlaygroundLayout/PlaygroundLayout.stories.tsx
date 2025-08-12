import { TopBar, BackButton, PrimaryButton } from '../..';
import { WireframePlaceholder } from '../../helpers/wireframe-placeholder';
import { withStepContainerV2ContextDecorator } from '../../helpers/withStepContainerV2ContextDecorator';
import { PlaygroundLayout } from './PlaygroundLayout';
import type { Meta } from '@storybook/react';

const meta: Meta< typeof PlaygroundLayout > = {
	title: 'Onboarding/StepWireframes/PlaygroundLayout',
	component: PlaygroundLayout,
	decorators: [ withStepContainerV2ContextDecorator ],
};

export default meta;

export const Default = () => (
	<PlaygroundLayout
		topBar={ <TopBar leftElement={ <BackButton /> } rightElement={ <PrimaryButton /> } /> }
	>
		<WireframePlaceholder height="100%">Main</WireframePlaceholder>
	</PlaygroundLayout>
);
