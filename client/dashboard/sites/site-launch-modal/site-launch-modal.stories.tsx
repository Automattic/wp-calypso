import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Icon,
	Modal,
} from '@wordpress/components';
import { copy, globe, payment } from '@wordpress/icons';
import { useState } from 'react';
import ConfettiAnimation from '../../components/confetti';
import './styles.scss';
import type { Meta, StoryObj } from '@storybook/react';

// NOTE: This is a presentational styling harness for the SiteLaunchModal variants. It
// mirrors the markup from ./site-launch-modal.tsx and uses the same styles.scss, but
// avoids importing the real component so Storybook does not pull in app/data modules
// (api-core/explat → server logger) that can't run in the browser. Keep the markup here
// in sync with the matching branch of SiteLaunchModal.

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
		<Modal
			className="site-launch-pre-launch-modal"
			title="Launching makes your site public."
			size="medium"
			onRequestClose={ () => setIsOpen( false ) }
		>
			<VStack spacing={ 6 }>
				<Text as="p">
					Share your work, connect with your audience, and take the next step toward your goals. Do
					you want to launch?
				</Text>
				<HStack
					className="site-launch-pre-launch-modal__preview-card"
					spacing={ 4 }
					alignment="center"
					justify="flex-start"
				>
					<div
						className="site-launch-pre-launch-modal__thumbnail"
						style={ { background: 'linear-gradient(135deg, #3858e9, #8c46ff)' } }
					/>
					<VStack spacing={ 1 } className="site-launch-pre-launch-modal__meta">
						<Text size={ 16 } weight={ 400 } truncate>
							{ siteName }
						</Text>
						<HStack spacing={ 2 } justify="flex-start" alignment="center">
							<Icon icon={ globe } size={ 20 } />
							<Text truncate>{ domain }</Text>
						</HStack>
						<HStack spacing={ 2 } justify="flex-start" alignment="center">
							<Icon icon={ payment } size={ 20 } />
							<Text truncate>{ planName }</Text>
						</HStack>
					</VStack>
				</HStack>
				<HStack justify="flex-end">
					<Button variant="primary" isBusy={ isLaunching } disabled={ isLaunching }>
						Yes, launch site!
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}

function CelebrationModalPreview( { domain }: { domain: string } ) {
	const [ isOpen, setIsOpen ] = useState( true );
	const [ copied, setCopied ] = useState( false );

	if ( ! isOpen ) {
		return (
			<Button variant="primary" onClick={ () => setIsOpen( true ) }>
				Open celebration modal
			</Button>
		);
	}

	return (
		<Modal
			className="celebration-modal"
			title="Congrats, your site is live!"
			size="medium"
			onRequestClose={ () => setIsOpen( false ) }
		>
			<ConfettiAnimation />
			<VStack spacing={ 6 }>
				<Text as="p">Now you can head over to your site and share it with the world.</Text>
				<div className="celebration-modal--content">
					<HStack>
						<HStack className="celebration-modal--url-container flex-shrink-safe">
							<Text as="p" weight={ 600 } truncate>
								{ domain }
							</Text>
							<Button
								variant="tertiary"
								size="compact"
								icon={ copy }
								label="Copy URL"
								title={ copied ? 'Copied!' : 'Copy URL' }
								onClick={ () => {
									setCopied( true );
									setTimeout( () => setCopied( false ), 2000 );
								} }
							/>
						</HStack>
						<Button icon={ globe } href="#" target="_blank">
							View site
						</Button>
					</HStack>
				</div>
				<HStack spacing={ 3 } alignment="bottomRight">
					<Text as="p" className="flex-shrink-safe">
						Supercharge your website with a <strong>custom address</strong> that matches your blog,
						brand, or business.
					</Text>
					<Button variant="primary" href="#">
						Get your domain
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}

const meta = {
	title: 'client/dashboard/SiteLaunchModal',
	component: PreLaunchModalPreview,
	parameters: { layout: 'fullscreen' },
} satisfies Meta< typeof PreLaunchModalPreview >;

export default meta;
type Story = StoryObj< typeof meta >;

export const PreLaunch: Story = {
	args: {
		siteName: 'Kaonashi',
		domain: 'kaonashi.com',
		planName: 'Business plan',
		isLaunching: false,
	},
};

export const Celebration: Story = {
	args: {
		siteName: 'Kaonashi',
		domain: 'kaonashi.com',
		planName: 'Business plan',
		isLaunching: false,
	},
	render: ( args ) => <CelebrationModalPreview domain={ args.domain } />,
};
