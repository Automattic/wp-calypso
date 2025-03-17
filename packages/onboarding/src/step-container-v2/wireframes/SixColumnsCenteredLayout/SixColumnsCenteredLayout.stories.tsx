import { createInterpolateElement } from '@wordpress/element';
import { Heading, TopBar, BackButton, NextButton, StickyBottomBar } from '../..';
import { WireframePlaceholder } from '../../helpers/wireframe-placeholder';
import { withStepContainerV2ContextDecorator } from '../../helpers/withStepContainerV2ContextDecorator';
import { SixColumnsCenteredLayout } from './SixColumnsCenteredLayout';
import type { Meta } from '@storybook/react';

const meta: Meta< typeof SixColumnsCenteredLayout > = {
	title: 'Onboarding/StepWireframes/SixColumnsCenteredLayout',
	component: SixColumnsCenteredLayout,
	decorators: [ withStepContainerV2ContextDecorator ],
};

export default meta;

export const Vanilla = () => {
	const backButton = <BackButton />;
	const nextButton = <NextButton />;

	return (
		<SixColumnsCenteredLayout
			topBar={ <TopBar backButton={ backButton } /> }
			heading={
				<Heading
					text="Centered Layout"
					subText={ createInterpolateElement(
						'An example of the <code>SixColumnsCenteredLayout</code> wireframe layout.',
						{
							code: <code />,
						}
					) }
				/>
			}
			stickyBottomBar={ <StickyBottomBar rightButton={ nextButton } /> }
			content={ <WireframePlaceholder height={ 370 }>Main</WireframePlaceholder> }
		/>
	);
};
