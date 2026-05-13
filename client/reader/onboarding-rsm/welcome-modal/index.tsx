import {
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { StepIndicator } from 'calypso/reader/onboarding-rsm/step-indicator';

import './style.scss';

interface WelcomeModalProps {
	onClose: () => void;
	onContinue: () => void;
}

type WelcomeTileItem = {
	name: string;
	imageUrl: string;
	imageClass?: string;
	porthole?: boolean;
};

const publications: WelcomeTileItem[] = [
	{
		name: 'Longreads',
		imageUrl: 'https://www.google.com/s2/favicons?domain=longreads.com&sz=128',
	},
	{
		name: 'The Atavist Magazine',
		imageUrl: 'https://www.google.com/s2/favicons?domain=magazine.atavist.com&sz=128',
	},
	{
		name: 'Time',
		imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Time_Magazine_logo.svg',
		imageClass: 'is-contained-logo is-contained-logo--time',
	},
	{
		name: 'Variety',
		imageUrl: 'https://www.google.com/s2/favicons?domain=variety.com&sz=128',
		porthole: true,
		imageClass: 'reader-welcome-modal__variety-image',
	},
	{
		name: 'Rolling Stone',
		imageUrl:
			'https://i0.wp.com/www.rollingstone.com/wp-content/uploads/2024/12/R-Avatar_512x512_flat.png?ssl=1&w=240',
	},
	{
		name: 'Wired',
		imageUrl: 'https://www.wired.com/apple-touch-icon.png',
	},
];

const bloggers: WelcomeTileItem[] = [
	{
		name: 'Matt Mullenweg',
		imageUrl:
			'https://0.gravatar.com/avatar/33252cd1f33526af53580fcb1736172f06e6716f32afdd1be19ec3096d15dea5?s=256',
		porthole: true,
		imageClass: 'reader-welcome-modal__matt-image',
	},
	{
		name: 'Seth Godin',
		imageUrl: 'https://seths.blog/wp-content/themes/godin/img/seth.webp',
		porthole: true,
		imageClass: 'reader-welcome-modal__seth-image',
	},
	{
		name: 'Tim Ferriss',
		imageUrl:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Tim_Ferriss.jpg/500px-Tim_Ferriss.jpg',
		porthole: true,
		imageClass: 'reader-welcome-modal__tim-image',
	},
	{
		name: 'Om Malik',
		imageUrl: 'https://om.co/wp-content/uploads/2024/05/Om-headshot.png',
		porthole: true,
		imageClass: 'reader-welcome-modal__om-image',
	},
	{
		name: 'Hugh Howey',
		imageUrl:
			'https://hughhowey.com/wp-content/themes/hughhowey2023new/assets/images/HH-circle.png',
		porthole: true,
		imageClass: 'reader-welcome-modal__hugh-image',
	},
];

const renderTileImage = ( item: WelcomeTileItem ) => {
	if ( item.porthole ) {
		return (
			<span className="reader-welcome-modal__image-porthole">
				<img
					src={ item.imageUrl }
					alt=""
					aria-hidden
					className={ clsx( 'reader-welcome-modal__porthole-image', item.imageClass ) }
				/>
			</span>
		);
	}
	return (
		<img
			src={ item.imageUrl }
			alt=""
			aria-hidden
			className={ clsx( 'reader-welcome-modal__tile-image', item.imageClass ) }
		/>
	);
};

// Renders the body of the "welcome" step. The shared <Modal> wrapper is
// provided by the parent (`ReaderOnboardingRsm`) so transitions between
// steps don't unmount/remount the modal frame.
const WelcomeModal: React.FC< WelcomeModalProps > = ( { onClose, onContinue } ) => {
	return (
		<>
			<VStack spacing={ 8 } className="reader-welcome-modal__content">
				<VStack
					spacing={ 1 }
					className="reader-welcome-modal__intro reader-welcome-modal__animate-in reader-welcome-modal__animate-in--intro"
				>
					<h2 className="reader-welcome-modal__title">{ __( 'Your reading home base' ) }</h2>
					<p className="reader-welcome-modal__subtitle">
						<span>{ __( 'All your favorite blogs and newsletters in one focused feed.' ) }</span>
						<br className="reader-welcome-modal__subtitle-break" />{ ' ' }
						<span>
							{ __( "Discover writers you'll love, no pop-ups, no clutter, just great writing." ) }
						</span>
					</p>
				</VStack>

				<div className="reader-welcome-modal__people-grid reader-welcome-modal__animate-in reader-welcome-modal__animate-in--people">
					<div className="reader-welcome-modal__tile-row">
						{ publications.map( ( publication ) => (
							<div key={ publication.name } className="reader-welcome-modal__tile">
								{ renderTileImage( publication ) }
								<span className="reader-welcome-modal__tile-label">{ publication.name }</span>
							</div>
						) ) }
					</div>
					<div className="reader-welcome-modal__tile-row">
						{ bloggers.map( ( blogger ) => (
							<div key={ blogger.name } className="reader-welcome-modal__tile">
								{ renderTileImage( blogger ) }
								<span className="reader-welcome-modal__tile-label">{ blogger.name }</span>
							</div>
						) ) }
					</div>
				</div>
			</VStack>

			<div className="reader-onboarding-modal__footer">
				<HStack justify="space-between" className="reader-onboarding-modal__footer-actions">
					<StepIndicator totalSteps={ 3 } currentStep={ 1 } />
					<HStack
						spacing={ 2 }
						justify="right"
						className="reader-onboarding-modal__footer-buttons reader-welcome-modal__footer-buttons"
					>
						<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose }>
							{ __( 'Do it later' ) }
						</Button>
						<Button __next40pxDefaultSize variant="primary" onClick={ onContinue }>
							{ __( 'Pick your topics' ) }
						</Button>
					</HStack>
				</HStack>
			</div>
		</>
	);
};

export default WelcomeModal;
