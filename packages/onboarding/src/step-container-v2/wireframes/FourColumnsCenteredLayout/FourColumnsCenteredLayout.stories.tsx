import { createInterpolateElement } from '@wordpress/element';
import { Heading, TopBar, BackButton, NextButton, StickyBottomBar, SkipButton } from '../..';
import { WireframePlaceholder } from '../../helpers/wireframe-placeholder';
import { withStepContainerV2ContextDecorator } from '../../helpers/withStepContainerV2ContextDecorator';
import { FourColumnsCenteredLayout } from './FourColumnsCenteredLayout';
import type { Meta } from '@storybook/react';

const meta: Meta< typeof FourColumnsCenteredLayout > = {
	title: 'Onboarding/StepWireframes/FourColumnsCenteredLayout',
	component: FourColumnsCenteredLayout,
	decorators: [ withStepContainerV2ContextDecorator ],
};

export default meta;

export const Vanilla = () => {
	const backButton = <BackButton />;
	const nextButton = <NextButton />;
	const skipButton = <SkipButton />;

	return (
		<FourColumnsCenteredLayout
			topBar={ <TopBar backButton={ backButton } skipButton={ skipButton } /> }
			heading={
				<Heading
					text="Centered Layout"
					subText={ createInterpolateElement(
						'An example of the <code>FourColumnsCenteredLayout</code> wireframe layout.',
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
