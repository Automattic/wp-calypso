import { createInterpolateElement } from '@wordpress/element';
import { Heading, TopBar, BackButton, PrimaryButton, StickyBottomBar } from '../..';
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
		topBar={ <TopBar leftElement={ <BackButton /> } /> }
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
		stickyBottomBar={ <StickyBottomBar rightElement={ <PrimaryButton /> } /> }
	>
		<WireframePlaceholder height={ 616 }>Main</WireframePlaceholder>
		<WireframePlaceholder height={ 616 }>Sidebar</WireframePlaceholder>
	</TwoColumnLayout>
);

export const EqualTwoColumnLayout = () => (
	<TwoColumnLayout
		firstColumnWidth={ 1 }
		secondColumnWidth={ 1 }
		topBar={ <TopBar leftElement={ <BackButton /> } /> }
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
		stickyBottomBar={ <StickyBottomBar rightElement={ <PrimaryButton /> } /> }
	>
		<WireframePlaceholder height={ 616 }>Content 1</WireframePlaceholder>
		<WireframePlaceholder height={ 616 }>Content 2</WireframePlaceholder>
	</TwoColumnLayout>
);

export const WithRenderProp = () => (
	<TwoColumnLayout
		firstColumnWidth={ 1 }
		secondColumnWidth={ 1 }
		topBar={ <TopBar leftElement={ <BackButton /> } /> }
		heading={
			<Heading
				text="Columns Rendered with Render Prop"
				subText={ createInterpolateElement(
					'An example of the <code>TwoColumnLayout</code> wireframe layout.',
					{
						code: <code />,
					}
				) }
			/>
		}
		stickyBottomBar={ <StickyBottomBar rightElement={ <PrimaryButton /> } /> }
	>
		{ ( { isSmallViewport, isLargeViewport } ) => (
			<>
				<WireframePlaceholder height={ 616 }>
					<div>Content 1</div>
					<pre>is small viewport: { isSmallViewport.toString() }</pre>
				</WireframePlaceholder>
				<WireframePlaceholder height={ 616 }>
					<div>Content 1</div>
					<pre>is large viewport: { isLargeViewport.toString() }</pre>
				</WireframePlaceholder>
			</>
		) }
	</TwoColumnLayout>
);
