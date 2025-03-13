import { Badge } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { StepContainerV2, StepContainerV2Provider } from './index';
import type { Meta, StoryObj } from '@storybook/react';

import './style.stories.scss';

export const withStepContainerV2ContextDecorator = ( Story: React.ComponentType ) => {
	return (
		<StepContainerV2Provider
			value={ { flowName: 'flowName', stepName: 'stepName', recordTracksEvent: () => {} } }
		>
			<Story />
		</StepContainerV2Provider>
	);
};

const meta: Meta< typeof StepContainerV2 > = {
	title: 'Onboarding/StepContainerV2',
	component: StepContainerV2,
	decorators: [ withStepContainerV2ContextDecorator ],
	excludeStories: [ 'withStepContainerV2ContextDecorator' ],
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

export const Domains = () => {
	return (
		<StepContainerV2
			className="domains"
			backButton={ () => {} }
			heading={ {
				text: 'Choose a domain',
				subText: 'Enter some descriptive keywords to get started.',
			} }
			render={ () => {
				return (
					<>
						<div className="domains__list">Domains list</div>
						<div className="domains__summary">Domains summary</div>
					</>
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
			className="design-picker"
			render={ () => (
				<>
					<div className="design-picker__nav-area">Nav area</div>
					<div className="design-picker__themes">Themes</div>
				</>
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
			className="theme-preview"
			render={ ( { heading, nextButton } ) => {
				return (
					<>
						<div className="theme-preview__details">
							<Badge style={ { marginBottom: isSmallScreen ? '0.5rem' : '1rem' } }>Premium</Badge>
							{ heading }
							{ nextButton && <div style={ { marginTop: '3rem' } }>{ nextButton }</div> }
						</div>
						<div className="theme-preview__preview">
							<span>Theme preview</span>
						</div>
					</>
				);
			} }
		/>
	);
};
