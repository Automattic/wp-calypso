import { Card, CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';

const CancelPurchaseLoadingPlaceholder = () => {
	/* eslint-disable wpcalypso/jsx-classname-namespace, jsx-a11y/heading-has-content */
	return (
		<Card className="cancel-purchase__inner-wrapper">
			<div className="cancel-purchase__left">
				<Card className="cancel-purchase-loading-placeholder__card">
					<h2 className="loading-placeholder__content cancel-purchase-loading-placeholder__header" />
					<div className="loading-placeholder__content cancel-purchase-loading-placeholder__subheader" />
					<div className="loading-placeholder__content cancel-purchase-loading-placeholder__reason" />
					<div className="loading-placeholder__content cancel-purchase-loading-placeholder__reason" />
				</Card>
			</div>

			<div className="cancel-purchase__right">
				<CompactCard>
					<div className="loading-placeholder__content cancel-purchase-loading-placeholder__subheader" />
					<div className="loading-placeholder__content cancel-purchase-loading-placeholder__reason" />
				</CompactCard>
			</div>
		</Card>
	);
};
/* eslint-enable wpcalypso/jsx-classname-namespace, jsx-a11y/heading-has-content */

export default localize( CancelPurchaseLoadingPlaceholder );
