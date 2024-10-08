import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';

const ConfirmCancelDomainLoadingPlaceholder = () => {
	return (
		<Card className="confirm-cancel-domain__loading-placeholder-card">
			<div className="loading-placeholder__content cancel-purchase-loading-placeholder__header" />
			<div className="loading-placeholder__content cancel-purchase-loading-placeholder__subheader" />
			<div className="loading-placeholder__content cancel-purchase-loading-placeholder__reason" />
			<div className="loading-placeholder__content cancel-purchase-loading-placeholder__reason" />
		</Card>
	);
};

export default localize( ConfirmCancelDomainLoadingPlaceholder );
