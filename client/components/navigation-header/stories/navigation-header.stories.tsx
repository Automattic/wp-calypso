import NavigationHeader from '../navigation-header';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof NavigationHeader > = {
	title: 'client/components/NavigationHeader',
	component: NavigationHeader,
	parameters: {
		layout: 'fullscreen',
	},
	tags: [ 'autodocs' ],
};

export default meta;
type Story = StoryObj< typeof NavigationHeader >;

const actionButtonStyle = {
	padding: '8px 16px',
	backgroundColor: 'var(--wp-components-color-accent, #2e7d32)',
	color: 'var(--wp-components-color-accent-inverted, #fff)',
	border: 'none',
	borderRadius: '4px',
	fontSize: '14px',
	cursor: 'pointer',
	transition: 'background-color 0.2s ease',
};

const downloadLinkStyle = {
	display: 'flex',
	alignItems: 'center',
	textDecoration: 'none',
	color: 'var(--wp-components-color-accent, #2e7d32)',
	fontSize: '14px',
	transition: 'color 0.2s ease',
	gap: '8px',
};

// Basic header with title only
export const Basic: Story = {
	args: {
		title: 'Basic Header',
	},
};

// Header with back link
export const WithBackLink: Story = {
	args: {
		title: 'Header with Back Link',
		backLinkProps: {
			url: '/dashboard',
			text: 'Back to Dashboard',
		},
	},
};

// Header with both download link and action button
export const WithDownloadAndAction: Story = {
	args: {
		title: 'Report Summary',
		backLinkProps: {
			url: '/reports',
			text: 'Back to Reports',
		},
		children: (
			<div style={ { display: 'flex', gap: '16px', alignItems: 'center' } }>
				<a href="/data.csv" download style={ downloadLinkStyle }>
					<svg
						width="16"
						height="17"
						viewBox="0 0 16 17"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M14 8.3L13 7.2L9 11.2V0H7.5V11.3L3 7.2L2 8.3L8.2 14.1L14 8.3ZM14.5 12V15.5H1.5V12H0V17H16V12H14.5Z"
							fill="currentColor"
						/>
					</svg>
					Download CSV
				</a>
			</div>
		),
	},
};

// Header with screen options tab
export const WithScreenOptions: Story = {
	args: {
		title: 'Analytics Dashboard',
		hasScreenOptionsTab: true,
		backLinkProps: {
			url: '/dashboard',
			text: 'Back to Dashboard',
			onBackClick: ( e ) => {
				e.preventDefault();
				alert( 'Back button clicked!' );
			},
		},
		children: (
			<div style={ { display: 'flex', gap: '16px', alignItems: 'center' } }>
				<button style={ actionButtonStyle } onClick={ () => alert( 'Action clicked!' ) }>
					Post
				</button>
			</div>
		),
	},
};
