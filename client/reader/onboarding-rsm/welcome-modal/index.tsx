import {
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import welcomeAtavistImage from 'calypso/assets/images/reader/onboarding/welcome-atavist.webp';
import welcomeHughImage from 'calypso/assets/images/reader/onboarding/welcome-hugh.webp';
import welcomeLongreadsImage from 'calypso/assets/images/reader/onboarding/welcome-longreads.webp';
import welcomeMattImage from 'calypso/assets/images/reader/onboarding/welcome-matt.webp';
import welcomeOmImage from 'calypso/assets/images/reader/onboarding/welcome-om.webp';
import welcomeRollingStoneImage from 'calypso/assets/images/reader/onboarding/welcome-rolling-stone.webp';
import welcomeSethImage from 'calypso/assets/images/reader/onboarding/welcome-seth.webp';
import welcomeTimImage from 'calypso/assets/images/reader/onboarding/welcome-tim.webp';
import welcomeTimeImage from 'calypso/assets/images/reader/onboarding/welcome-time.webp';
import welcomeVarietyImage from 'calypso/assets/images/reader/onboarding/welcome-variety.webp';
import welcomeWiredImage from 'calypso/assets/images/reader/onboarding/welcome-wired.webp';
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
		imageUrl: welcomeLongreadsImage,
	},
	{
		name: 'The Atavist Magazine',
		imageUrl: welcomeAtavistImage,
	},
	{
		name: 'Time',
		imageUrl: welcomeTimeImage,
		imageClass: 'is-contained-logo is-contained-logo--time',
	},
	{
		name: 'Variety',
		imageUrl: welcomeVarietyImage,
		porthole: true,
		imageClass: 'reader-welcome-modal__variety-image',
	},
	{
		name: 'Rolling Stone',
		imageUrl: welcomeRollingStoneImage,
	},
	{
		name: 'Wired',
		imageUrl: welcomeWiredImage,
	},
];

const bloggers: WelcomeTileItem[] = [
	{
		name: 'Matt Mullenweg',
		imageUrl: welcomeMattImage,
		porthole: true,
		imageClass: 'reader-welcome-modal__matt-image',
	},
	{
		name: 'Seth Godin',
		imageUrl: welcomeSethImage,
		porthole: true,
		imageClass: 'reader-welcome-modal__seth-image',
	},
	{
		name: 'Tim Ferriss',
		imageUrl: welcomeTimImage,
		porthole: true,
		imageClass: 'reader-welcome-modal__tim-image',
	},
	{
		name: 'Om Malik',
		imageUrl: welcomeOmImage,
		porthole: true,
		imageClass: 'reader-welcome-modal__om-image',
	},
	{
		name: 'Hugh Howey',
		imageUrl: welcomeHughImage,
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
