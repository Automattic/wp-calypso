import { createInterpolateElement } from '@wordpress/element';
import { Heading, TopBar, BackButton, PrimaryButton, StickyBottomBar } from '../..';
import { WireframePlaceholder } from '../../helpers/wireframe-placeholder';
import { withStepContainerV2ContextDecorator } from '../../helpers/withStepContainerV2ContextDecorator';
import { WideLayout } from './WideLayout';
import type { Meta } from '@storybook/react';

const meta: Meta< typeof WideLayout > = {
	title: 'Onboarding/StepWireframes/WideLayout',
	component: WideLayout,
	decorators: [ withStepContainerV2ContextDecorator ],
};

export default meta;

export const Default = () => (
	<WideLayout
		topBar={ <TopBar leftElement={ <BackButton /> } /> }
		heading={
			<Heading
				text="Wide layout"
				subText={ createInterpolateElement(
					'An example of the <code>WideLayout</code> wireframe layout.',
					{
						code: <code />,
					}
				) }
			/>
		}
		stickyBottomBar={ <StickyBottomBar rightElement={ <PrimaryButton /> } /> }
	>
		<WireframePlaceholder height={ 616 }>Main</WireframePlaceholder>
	</WideLayout>
);
