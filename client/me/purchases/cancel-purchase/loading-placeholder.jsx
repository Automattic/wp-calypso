import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import LoadingPlaceholderCancelPurchasePage from 'calypso/me/purchases/components/loading-placeholder/cancel-purchase-page';
import titles from 'calypso/me/purchases/titles';

const CancelPurchaseLoadingPlaceholder = ( { purchaseId, siteSlug, getManagePurchaseUrlFor } ) => {
	let path;

	if ( siteSlug ) {
		path = getManagePurchaseUrlFor( siteSlug, purchaseId );
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace, jsx-a11y/heading-has-content */
	return (
		<LoadingPlaceholderCancelPurchasePage
			title={ titles.cancelPurchase }
			path={ path }
			isFullWidth={ true }
		>
			<h2 className="loading-placeholder__content cancel-purchase-loading-placeholder__header" />
			<div className="loading-placeholder__content cancel-purchase-loading-placeholder__subheader" />
			<div className="loading-placeholder__content cancel-purchase-loading-placeholder__reason" />
			<div className="loading-placeholder__content cancel-purchase-loading-placeholder__reason" />
		</LoadingPlaceholderCancelPurchasePage>
	);
};
/* eslint-enable wpcalypso/jsx-classname-namespace, jsx-a11y/heading-has-content */

CancelPurchaseLoadingPlaceholder.propTypes = {
	purchaseId: PropTypes.number.isRequired,
	siteSlug: PropTypes.string.isRequired,
	getManagePurchaseUrlFor: PropTypes.func.isRequired,
};

export default localize( CancelPurchaseLoadingPlaceholder );
