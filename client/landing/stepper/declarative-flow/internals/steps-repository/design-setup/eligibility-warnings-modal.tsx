import { Dialog } from '@automattic/components';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import type { SiteDetails } from '@automattic/data-stores';
import './eligibility-warnings-modal.scss';

export const EligibilityWarningsModal = ( {
	site,
	isMarketplace,
	isOpen,
	handleClose,
	handleContinue,
}: {
	site?: SiteDetails;
	isMarketplace?: boolean;
	isOpen: boolean;
	handleClose: () => void;
	handleContinue: () => void;
} ) => {
	return (
		<Dialog
			additionalClassNames="eligibility-warnings-modal__dialog-content"
			isVisible={ isOpen }
			onClose={ handleClose }
			showCloseIcon
		>
			<EligibilityWarnings
				siteId={ site?.ID }
				standaloneProceed
				isOnboarding
				isMarketplace={ isMarketplace }
				onDismiss={ handleClose }
				onProceed={ handleContinue }
			/>
		</Dialog>
	);
};
