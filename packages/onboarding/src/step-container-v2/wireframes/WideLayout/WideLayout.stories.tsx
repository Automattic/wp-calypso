import { createInterpolateElement } from '@wordpress/element';
import { Heading, TopBar, BackButton, PrimaryButton, StickyBottomBar } from '../..';
import { WireframePlaceholder } from '../../helpers/wireframe-placeholder';
import { withStepContainerV2ContextDecorator } from '../../helpers/withStepContainerV2ContextDecorator';
import { WideLayout } from './WideLayout';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof WideLayout > = {
	title: 'Onboarding/StepWireframes/WideLayout',
	component: WideLayout,
	decorators: [ withStepContainerV2ContextDecorator ],
};

export default meta;

export const Wide_Default = () => (
	<WideLayout
		topBar={ <TopBar leftElement={ <BackButton /> } /> }
		heading={
			<Heading
				text="Wide layout"
				subText={ createInterpolateElement(
					'A <code>WideLayout</code> with the heading rendered in the default 12-column track. This subtext is intentionally long enough that you can compare it side-by-side with the 6-column variant and see the wrapping change.',
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

export const Wide_HeadingSixColumns = () => (
	<WideLayout
		topBar={ <TopBar leftElement={ <BackButton /> } /> }
		heading={
			<Heading
				text="Wide layout — 6-column heading"
				subText={ createInterpolateElement(
					'A <code>WideLayout</code> with the heading constrained to a 6-column track (matching the heading width used by <code>CenteredColumnLayout</code> by default). Main content keeps the full 12-column width. This subtext is intentionally long enough that you can compare it side-by-side with the default and see the wrapping change.',
					{
						code: <code />,
					}
				) }
			/>
		}
		headingColumnWidth={ 6 }
		stickyBottomBar={ <StickyBottomBar rightElement={ <PrimaryButton /> } /> }
	>
		<WireframePlaceholder height={ 616 }>Main</WireframePlaceholder>
	</WideLayout>
);

type WideLayoutStory = StoryObj< typeof WideLayout >;

export const Wide_Playground: WideLayoutStory = {
	args: {
		topBar: <TopBar leftElement={ <BackButton /> } />,
		heading: (
			<Heading
				text="Wide layout — Playground"
				subText={ createInterpolateElement(
					'Use the <code>Controls</code> panel to switch <code>headingColumnWidth</code> between values and watch the heading wrapper resize. The main content row below stays full-width regardless.',
					{
						code: <code />,
					}
				) }
			/>
		),
		headingColumnWidth: 6,
		stickyBottomBar: <StickyBottomBar rightElement={ <PrimaryButton /> } />,
		children: <WireframePlaceholder height={ 616 }>Main</WireframePlaceholder>,
	},
	argTypes: {
		headingColumnWidth: {
			control: { type: 'select' },
			options: [ undefined, 4, 5, 6, 8, 10 ],
		},
	},
};
