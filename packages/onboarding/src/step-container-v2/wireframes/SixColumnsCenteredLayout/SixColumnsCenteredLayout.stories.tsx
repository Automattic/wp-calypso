import { Heading, TopBar, BackButton, NextButton, StickyBottomBar } from '../..';
import SelectCardCheckbox from '../../../select-card-checkbox';
import { withStepContainerV2ContextDecorator } from '../../helpers/withStepContainerV2ContextDecorator';
import { SixColumnsCenteredLayout } from './SixColumnsCenteredLayout';
import type { Meta } from '@storybook/react';

import './style.stories.scss';

const meta: Meta< typeof SixColumnsCenteredLayout > = {
	title: 'Onboarding/StepWireframes/SixColumnsCenteredLayout',
	component: SixColumnsCenteredLayout,
	decorators: [ withStepContainerV2ContextDecorator ],
};

export default meta;

const goals = [
	{
		key: 'write',
		title: 'Publish a blog',
	},
	{
		key: 'engagement',
		title: 'Build and engage an audience',
	},
	{
		key: 'collect-donations',
		title: 'Collect donations',
	},
	{
		key: 'portfolio',
		title: 'Showcase work/portfolio',
	},
	{
		key: 'build-nonprofit',
		title: 'Build a site for a school or nonprofit',
	},
	{
		key: 'newsletter',
		title: 'Create a newsletter',
	},
	{
		key: 'sell-digital',
		title: 'Sell services or digital goods',
	},
	{
		key: 'sell-physical',
		title: 'Sell physical goods',
	},
	{
		key: 'promote',
		title: 'Promote my business',
	},
	{
		key: 'courses',
		title: 'Create a course',
	},
	{
		key: 'contact-form',
		title: 'Create a contact form',
	},
	{
		key: 'videos',
		title: 'Upload videos',
	},
	{
		key: 'paid-subscribers',
		title: 'Offer paid content to members',
	},
	{
		key: 'announce-events',
		title: 'Announce events',
	},
];

export const GoalsStep = () => {
	const backButton = <BackButton />;
	const nextButton = <NextButton />;

	return (
		<SixColumnsCenteredLayout
			className="goals"
			topBar={ <TopBar backButton={ backButton } /> }
			heading={
				<Heading
					text="What would you like to create?"
					subText="Pick one or more goals to get started."
				/>
			}
			stickyBottomBar={ <StickyBottomBar rightButton={ nextButton } /> }
			render={ ( { isMediumViewport } ) => (
				<>
					<div className="goals__list">
						{ goals.map( ( goal ) => (
							<SelectCardCheckbox key={ goal.key } checked={ false } onChange={ () => {} }>
								<span>{ goal.title }</span>
							</SelectCardCheckbox>
						) ) }
					</div>
					{ isMediumViewport && <div style={ { marginTop: '3rem' } }>{ nextButton }</div> }
				</>
			) }
		/>
	);
};
