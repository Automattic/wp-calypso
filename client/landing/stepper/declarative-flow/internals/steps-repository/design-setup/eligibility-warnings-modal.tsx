import { Dialog } from '@automattic/components';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import type { SiteDetails } from '@automattic/data-stores';

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
			additionalClassNames="plugin-details-cta__dialog-content"
			additionalOverlayClassNames="plugin-details-cta__modal-overlay"
			isVisible={ isOpen }
			onClose={ handleClose }
			showCloseIcon={ true }
		>
			<EligibilityWarnings
				siteId={ site?.ID }
				currentContext="plugin-details"
				standaloneProceed
				isMarketplace={ isMarketplace }
				isMarketplaceException={ isMarketplace }
				onProceed={ handleContinue }
				backUrl="#"
			/>
		</Dialog>
	);
};
