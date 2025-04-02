import { createInterpolateElement } from '@wordpress/element';
import { Heading, TopBar, BackButton, PrimaryButton, StickyBottomBar, SkipButton } from '../..';
import { WireframePlaceholder } from '../../helpers/wireframe-placeholder';
import { withStepContainerV2ContextDecorator } from '../../helpers/withStepContainerV2ContextDecorator';
import { CenteredColumnLayout } from './CenteredColumnLayout';
import type { Meta } from '@storybook/react';

const meta: Meta< typeof CenteredColumnLayout > = {
	title: 'Onboarding/StepWireframes/CenteredColumnLayout',
	component: CenteredColumnLayout,
	decorators: [ withStepContainerV2ContextDecorator ],
};

export default meta;

export const FourColumnsCenteredLayout = () => {
	const backButton = <BackButton />;
	const nextButton = <PrimaryButton />;
	const skipButton = <SkipButton />;

	return (
		<CenteredColumnLayout
			columnWidth={ 4 }
			topBar={ <TopBar leftElement={ backButton } rightElement={ skipButton } /> }
			heading={
				<Heading
					text="Four Columns Centered Layout"
					subText={ createInterpolateElement(
						'An example of the <code>CenteredColumnLayout</code> wireframe layout.',
						{
							code: <code />,
						}
					) }
				/>
			}
			stickyBottomBar={ <StickyBottomBar rightElement={ nextButton } /> }
		>
			<WireframePlaceholder height={ 370 }>Content</WireframePlaceholder>
		</CenteredColumnLayout>
	);
};

export const SixColumnsCenteredLayout = () => {
	const backButton = <BackButton />;
	const nextButton = <PrimaryButton />;
	const skipButton = <SkipButton />;

	return (
		<CenteredColumnLayout
			columnWidth={ 6 }
			topBar={ <TopBar leftElement={ backButton } rightElement={ skipButton } /> }
			heading={
				<Heading
					text="Six Columns Centered Layout"
					subText={ createInterpolateElement(
						'An example of the <code>CenteredColumnLayout</code> wireframe layout.',
						{
							code: <code />,
						}
					) }
				/>
			}
			stickyBottomBar={ <StickyBottomBar rightElement={ nextButton } /> }
		>
			<WireframePlaceholder height={ 500 }>Content</WireframePlaceholder>
		</CenteredColumnLayout>
	);
};

export const EightColumnsCenteredLayout = () => {
	const backButton = <BackButton />;
	const nextButton = <PrimaryButton />;
	const skipButton = <SkipButton />;

	return (
		<CenteredColumnLayout
			columnWidth={ 8 }
			topBar={ <TopBar leftElement={ backButton } rightElement={ skipButton } /> }
			heading={
				<Heading
					text="Eight Columns Centered Layout"
					subText={ createInterpolateElement(
						'An example of the <code>CenteredColumnLayout</code> wireframe layout.',
						{
							code: <code />,
						}
					) }
				/>
			}
			stickyBottomBar={ <StickyBottomBar rightElement={ nextButton } /> }
		>
			<WireframePlaceholder height={ 500 }>Content</WireframePlaceholder>
		</CenteredColumnLayout>
	);
};
