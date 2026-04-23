import {
	Modal,
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { StepIndicator } from 'calypso/reader/onboarding-rsm/step-indicator';

import './style.scss';

interface WelcomeModalProps {
	isOpen: boolean;
	onClose: () => void;
	onContinue: () => void;
}

type WelcomeTileItem = {
	name: string;
	imageUrl: string;
	imageClass?: string;
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
	},
	{
		name: 'Seth Godin',
		imageUrl: 'https://seths.blog/wp-content/themes/godin/img/seth.webp',
	},
	{
		name: 'Tim Ferriss',
		imageUrl:
			'https://i0.wp.com/tim.blog/wp-content/uploads/2025/05/timabout.jpg?resize=1080%2C1525&ssl=1',
	},
	{
		name: 'Om Malik',
		imageUrl: 'https://om.co/wp-content/uploads/2024/05/Om-headshot.png',
	},
	{
		name: 'Hugh Howey',
		imageUrl:
			'https://hughhowey.com/wp-content/themes/hughhowey2023new/assets/images/HH-circle.png',
	},
];

const WelcomeModal: React.FC< WelcomeModalProps > = ( { isOpen, onClose, onContinue } ) => {
	return (
		isOpen && (
			<Modal onRequestClose={ onClose } size="medium" className="welcome-modal">
				<VStack spacing={ 8 } className="welcome-modal__content">
					<VStack spacing={ 1 } className="welcome-modal__intro">
						<h2 className="welcome-modal__title">{ __( 'Your reading home base' ) }</h2>
						<p className="welcome-modal__subtitle">
							<span>{ __( 'All your favorite blogs and newsletters in one focused feed.' ) }</span>
							<br />
							<span>
								{ __(
									"Discover writers you'll love, no pop-ups, no clutter, just great writing."
								) }
							</span>
						</p>
					</VStack>

					<div className="welcome-modal__people-grid">
						<div className="welcome-modal__tile-row">
							{ publications.map( ( publication ) => (
								<div key={ publication.name } className="welcome-modal__tile">
									{ publication.name === 'Variety' ? (
										<span className="welcome-modal__variety-frame">
											<img
												src={ publication.imageUrl }
												alt=""
												aria-hidden
												className="welcome-modal__variety-image"
											/>
										</span>
									) : (
										<img
											src={ publication.imageUrl }
											alt=""
											aria-hidden
											className={ `welcome-modal__tile-image ${ publication.imageClass || '' }` }
										/>
									) }
									<span className="welcome-modal__tile-label">{ publication.name }</span>
								</div>
							) ) }
						</div>
						<div className="welcome-modal__tile-row">
							{ bloggers.map( ( blogger ) => (
								<div key={ blogger.name } className="welcome-modal__tile">
									{ blogger.name === 'Seth Godin' ? (
										<span className="welcome-modal__seth-frame">
											<img
												src={ blogger.imageUrl }
												alt=""
												aria-hidden
												className="welcome-modal__seth-image"
											/>
										</span>
									) : (
										<img
											src={ blogger.imageUrl }
											alt=""
											aria-hidden
											className={ `welcome-modal__tile-image ${ blogger.imageClass || '' }` }
										/>
									) }
									<span className="welcome-modal__tile-label">{ blogger.name }</span>
								</div>
							) ) }
						</div>
					</div>

					<div className="reader-onboarding-modal__footer">
						<HStack justify="space-between" className="reader-onboarding-modal__footer-actions">
							<StepIndicator totalSteps={ 3 } currentStep={ 1 } />
							<HStack
								spacing={ 2 }
								justify="right"
								className="reader-onboarding-modal__footer-buttons welcome-modal__footer-buttons"
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
				</VStack>
			</Modal>
		)
	);
};

export default WelcomeModal;
