import { Badge } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import SelectCardCheckbox from '../select-card-checkbox';
import { StepContainerV2 } from './index';
import type { Meta, StoryObj } from '@storybook/react';

import './style.stories.scss';

const meta: Meta< typeof StepContainerV2 > = {
	title: 'Onboarding/StepContainerV2',
	component: StepContainerV2,
};

type Story = StoryObj< typeof meta >;

export default meta;

export const Default: Story = {
	args: {
		heading: {
			text: 'Title',
			subText: 'Subtitle',
		},
		backButton: () => {},
		skipButton: () => {},
		nextButton: () => {},
		render: ( { nextButton } ) => {
			return (
				<div className="default">
					<p>Content</p>
					{ nextButton }
				</div>
			);
		},
	},
};

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

export const Goals = () => {
	return (
		<StepContainerV2
			heading={ {
				text: 'What would you like to create?',
				subText: 'Pick one or more goals to get started.',
			} }
			backButton={ () => {} }
			skipButton={ () => {} }
			nextButton={ {
				label: 'Continue',
				onClick: () => {},
			} }
			render={ ( { nextButton } ) => {
				return (
					<div className="goals">
						<div className="goals__list">
							{ goals.map( ( goal ) => (
								<SelectCardCheckbox key={ goal.key } checked={ false } onChange={ () => {} }>
									<span>{ goal.title }</span>
								</SelectCardCheckbox>
							) ) }
						</div>
						{ nextButton && <div style={ { marginTop: '3rem' } }>{ nextButton }</div> }
					</div>
				);
			} }
		/>
	);
};

export const User = () => {
	return (
		<StepContainerV2
			heading={ {
				text: 'Create account',
				subText: 'Nice picks! Set up an account to save your progress.',
			} }
			backButton={ () => {} }
			skipButton={ {
				label: 'Login',
				onClick: () => {},
			} }
			verticalAlign="center"
			render={ () => {
				return (
					<div className="user">
						<div style={ { display: 'flex', gap: '1rem', flexDirection: 'column' } }>
							<Button variant="secondary">Google</Button>
							<Button variant="secondary">Apple</Button>
						</div>
						<p style={ { marginTop: '3rem' } }>The ToS comes here.</p>
					</div>
				);
			} }
		/>
	);
};

export const DIFM = () => {
	return (
		<StepContainerV2
			heading={ {
				text: 'Let us build your site',
				subText: 'One time fee',
				align: 'left',
				customPlacement: true,
			} }
			backButton={ () => {} }
			skipButton={ () => {} }
			nextButton={ {
				label: 'Hire a professional',
				onClick: () => {},
			} }
			// nextButton will be null on small screens
			render={ ( { heading, nextButton } ) => {
				return (
					<div className="difm">
						<div className="difm__content">
							<div>
								{ heading }
								<p>DIFM rules</p>
								{ nextButton }
							</div>
							<div>
								<span>DIFM image</span>
							</div>
						</div>
						<div style={ { textAlign: 'center' } }>
							<button>FAQ</button>
						</div>
					</div>
				);
			} }
		/>
	);
};

export const Domains = () => {
	return (
		<StepContainerV2
			backButton={ () => {} }
			heading={ {
				text: 'Choose a domain',
				subText: 'Enter some descriptive keywords to get started.',
			} }
			render={ () => {
				return (
					<div>
						<div>Domains list</div>
						<div>Domains summary</div>
					</div>
				);
			} }
		/>
	);
};

export const DesignPickerWide = () => {
	return (
		<StepContainerV2
			heading={ {
				text: 'Design Picker',
				subText: 'Pick a theme',
			} }
			width="wide"
			backButton={ () => {} }
			skipButton={ () => {} }
			render={ () => (
				<div>
					<div>Nav area</div>
					<div>Themes</div>
				</div>
			) }
		/>
	);
};

export const ThemePreviewFullWidth = () => {
	const isSmallScreen = useViewportMatch( 'medium', '<' );

	return (
		<StepContainerV2
			isSmallScreen={ isSmallScreen }
			heading={ {
				text: 'Vetro',
				subText: 'Vetro description',
				customPlacement: true,
				align: 'left',
				size: 'small',
			} }
			width="full"
			bottomBar={ {
				backButton: true,
			} }
			backButton={ {
				label: 'Back',
				onClick: () => {},
			} }
			nextButton={ {
				label: 'Continue',
				onClick: () => {},
			} }
			render={ ( { heading, nextButton } ) => {
				if ( isSmallScreen ) {
					return (
						<div>
							<div>
								<Badge style={ { marginBottom: '8px' } }>Premium</Badge>
								{ heading }
							</div>
							<div style={ { marginTop: '3rem' } }>
								<span>Theme preview</span>
							</div>
						</div>
					);
				}

				return (
					<div className="theme-preview">
						<div>
							<Badge style={ { marginBottom: '1rem' } }>Premium</Badge>
							{ heading }
							<div style={ { marginTop: '3rem' } }>{ nextButton }</div>
						</div>
						<div>
							<span>Theme preview</span>
						</div>
					</div>
				);
			} }
		/>
	);
};
