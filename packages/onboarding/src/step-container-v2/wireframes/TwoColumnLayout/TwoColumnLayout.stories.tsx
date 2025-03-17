import { createInterpolateElement } from '@wordpress/element';
import { Heading, TopBar, BackButton, NextButton, StickyBottomBar } from '../..';
import { WireframePlaceholder } from '../../helpers/wireframe-placeholder';
import { withStepContainerV2ContextDecorator } from '../../helpers/withStepContainerV2ContextDecorator';
import { TwoColumnLayout } from './TwoColumnLayout';
import type { Meta } from '@storybook/react';

const meta: Meta< typeof TwoColumnLayout > = {
	title: 'Onboarding/StepWireframes/TwoColumnLayout',
	component: TwoColumnLayout,
	decorators: [ withStepContainerV2ContextDecorator ],
};

export default meta;

export const ThreeColumnsOnRightLayout = () => (
	<TwoColumnLayout
		firstColumnWidth={ 2 }
		secondColumnWidth={ 1 }
		topBar={ <TopBar backButton={ <BackButton /> } /> }
		heading={
			<Heading
				text="Three Columns on the Right"
				subText={ createInterpolateElement(
					'An example of the <code>TwoColumnLayout</code> wireframe layout.',
					{
						code: <code />,
					}
				) }
			/>
		}
		stickyBottomBar={ <StickyBottomBar rightButton={ <NextButton /> } /> }
		mainContent={ <WireframePlaceholder height={ 616 }>Main</WireframePlaceholder> }
		rightContent={ <WireframePlaceholder height={ 616 }>Sidebar</WireframePlaceholder> }
	/>
);

export const EqualTwoColumnLayout = () => (
	<TwoColumnLayout
		firstColumnWidth={ 1 }
		secondColumnWidth={ 1 }
		topBar={ <TopBar backButton={ <BackButton /> } /> }
		heading={
			<Heading
				text="Two Equal Columns"
				subText={ createInterpolateElement(
					'An example of the <code>TwoColumnLayout</code> wireframe layout.',
					{
						code: <code />,
					}
				) }
			/>
		}
		stickyBottomBar={ <StickyBottomBar rightButton={ <NextButton /> } /> }
		mainContent={ <WireframePlaceholder height={ 616 }>Content 1</WireframePlaceholder> }
		rightContent={ <WireframePlaceholder height={ 616 }>Content 2</WireframePlaceholder> }
	/>
);
