import { Button } from '@wordpress/components';
import { useState } from 'react';
import PreLaunchModal from '.';
import type { Meta, StoryObj } from '@storybook/react';

interface PreLaunchArgs {
	siteName: string;
	domain: string;
	planName: string;
	isLaunching: boolean;
	usePublishCopy: boolean;
}

function PreLaunchModalPreview( {
	siteName,
	domain,
	planName,
	isLaunching,
	usePublishCopy,
}: PreLaunchArgs ) {
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
			usePublishCopy={ usePublishCopy }
			onLaunch={ () => {} }
			onClose={ () => setIsOpen( false ) }
			preview={
				<div
					className="site-launch-pre-launch-modal__thumbnail"
					style={ {
						inlineSize: '114px',
						blockSize: '88px',
						borderRadius: '4px',
						flexShrink: 0,
						background: 'linear-gradient(135deg, #3858e9, #8c46ff)',
					} }
				/>
			}
		/>
	);
}

const meta = {
	title: 'packages/SiteLaunchModals/Pre-launch',
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
		usePublishCopy: false,
	},
};

export const Launching: Story = {
	args: {
		...Default.args,
		isLaunching: true,
	},
};

export const PublishCopy: Story = {
	args: {
		...Default.args,
		usePublishCopy: true,
	},
};
