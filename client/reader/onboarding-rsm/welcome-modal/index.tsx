import {
	Modal,
	Button,
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import './style.scss';

interface WelcomeModalProps {
	isOpen: boolean;
	onClose: () => void;
	onContinue: () => void;
}

const WelcomeModal: React.FC< WelcomeModalProps > = ( { isOpen, onClose, onContinue } ) => {
	return (
		isOpen && (
			<Modal onRequestClose={ onClose } size="fill" className="welcome-modal">
				<VStack spacing={ 8 } className="welcome-modal__content">
					<VStack spacing={ 3 } className="welcome-modal__intro">
						<h2 className="welcome-modal__title">{ __( 'Welcome to Reader' ) }</h2>
						<p className="welcome-modal__subtitle">
							{ __(
								'Set up your feed in a few quick steps. We will help you find topics and sites you enjoy, so your Reader feels personal right away.'
							) }
						</p>
					</VStack>

					<HStack className="welcome-modal__cards" spacing={ 4 } alignment="left">
						<Card className="welcome-modal__card">
							<CardBody>
								<h3>{ __( 'Follow topics' ) }</h3>
								<p>{ __( 'Choose interests to shape what appears in your feed.' ) }</p>
							</CardBody>
						</Card>
						<Card className="welcome-modal__card">
							<CardBody>
								<h3>{ __( 'Discover sites' ) }</h3>
								<p>{ __( 'Get recommendations and subscribe to writers you like.' ) }</p>
							</CardBody>
						</Card>
						<Card className="welcome-modal__card">
							<CardBody>
								<h3>{ __( 'Complete your profile' ) }</h3>
								<p>{ __( 'Add your profile details so people can connect with you.' ) }</p>
							</CardBody>
						</Card>
					</HStack>

					<div className="reader-onboarding-modal__footer">
						<HStack justify="right" className="reader-onboarding-modal__footer-actions">
							<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose }>
								{ __( 'Do it later' ) }
							</Button>
							<Button __next40pxDefaultSize variant="primary" onClick={ onContinue }>
								{ __( 'Pick your topics' ) }
							</Button>
						</HStack>
					</div>
				</VStack>
			</Modal>
		)
	);
};

export default WelcomeModal;
