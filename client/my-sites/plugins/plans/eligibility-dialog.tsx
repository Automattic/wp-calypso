import { Dialog } from '@automattic/components';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';

const EligibilityDialog = ( {
	isVisible,
	onClose,
}: {
	isVisible: boolean;
	onClose: () => void;
} ) => {
	const isMarketplaceProduct = true;
	return (
		<Dialog
			additionalClassNames={ 'plugin-details-cta__dialog-content' }
			additionalOverlayClassNames={ 'plugin-details-cta__modal-overlay' }
			isVisible={ isVisible }
			onClose={ onClose }
		>
			<EligibilityWarnings
				currentContext={ 'plugin-details' }
				isMarketplace={ isMarketplaceProduct }
				backUrl=""
			/>
		</Dialog>
	);
};

export default EligibilityDialog;
