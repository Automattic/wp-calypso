import { createInterpolateElement } from '@wordpress/element';
import { Heading, TopBar, BackButton, NextButton, StickyBottomBar } from '../..';
import {
	withStepContainerV2ContextDecorator,
	WireframePlaceholder,
} from '../../helpers/withStepContainerV2ContextDecorator';
import { ThreeColumnsOnRightLayout } from './ThreeColumnsOnRightLayout';
import type { Meta } from '@storybook/react';

const meta: Meta< typeof ThreeColumnsOnRightLayout > = {
	title: 'Onboarding/StepWireframes/ThreeColumnsOnRightLayout',
	component: ThreeColumnsOnRightLayout,
	decorators: [ withStepContainerV2ContextDecorator ],
};

export default meta;

export const Vanilla = () => (
	<ThreeColumnsOnRightLayout
		topBar={ <TopBar backButton={ <BackButton /> } /> }
		heading={
			<Heading
				text="Column on the Right"
				subText={ createInterpolateElement(
					'An example of the <code>ThreeColumnsOnRightLayout</code> wireframe layout.',
					{
						code: <code />,
					}
				) }
			/>
		}
		stickyBottomBar={ <StickyBottomBar rightButton={ <NextButton /> } /> }
		renderMain={ () => <WireframePlaceholder height={ 616 }>Main</WireframePlaceholder> }
		renderRight={ () => <WireframePlaceholder height={ 616 }>Right</WireframePlaceholder> }
	/>
);
