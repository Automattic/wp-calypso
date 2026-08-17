import { Button } from '@wordpress/components';
import { useState } from 'react';
import PreLaunchModal from './pre-launch-modal';
import '../styles.scss';
import type { Meta, StoryObj } from '@storybook/react';

// Renders the real PreLaunchModal view. The data/analytics container
// (../index.tsx) is skipped because Storybook does not set up the app's query,
// router, and analytics providers.

interface PreLaunchArgs {
	siteName: string;
	domain: string;
	planName: string;
	isLaunching: boolean;
}

function PreLaunchModalPreview( { siteName, domain, planName, isLaunching }: PreLaunchArgs ) {
	const [ isOpen, setIsOpen ] = useState( true );

	if ( ! isOpen ) {
		return (
			<Button variant="primary" onClick={ () => setIsOpen( true ) }>
				Open pre-launch modal
			</Button>
		);
	}

	return (
		<PreLaunchModal
			siteName={ siteName }
			siteDomain={ domain }
			planName={ planName }
			isLaunching={ isLaunching }
			onLaunch={ () => {} }
			onClose={ () => setIsOpen( false ) }
			preview={
				<div
					className="site-launch-pre-launch-modal__thumbnail"
					style={ { background: 'linear-gradient(135deg, #3858e9, #8c46ff)' } }
				/>
			}
		/>
	);
}

const meta = {
	title: 'client/dashboard/SiteLaunchModal/Pre-launch',
	component: PreLaunchModalPreview,
	parameters: { layout: 'fullscreen' },
} satisfies Meta< typeof PreLaunchModalPreview >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {
		siteName: 'Kaonashi',
		domain: 'kaonashi.com',
		planName: 'Business plan',
		isLaunching: false,
	},
};

export const Launching: Story = {
	args: {
		...Default.args,
		isLaunching: true,
	},
};
