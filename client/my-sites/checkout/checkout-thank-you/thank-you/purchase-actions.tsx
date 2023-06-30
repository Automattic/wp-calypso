import {
	isDomainMapping,
	isDomainRegistration,
	isDomainTransfer,
	isGSuiteOrExtraLicenseOrGoogleWorkspace,
	isTitanMail,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

const PurchaseActions = ( {
	isDataLoaded,
	isGenericReceipt,
	purchases,
	hasFailedPurchases,
}: {
	isDataLoaded?: boolean;
	isGenericReceipt?: boolean;
	purchases?: ReceiptPurchase[];
	hasFailedPurchases?: boolean;
} ) => {
	const classes = classNames( 'thank-you-purchase-actions', {
		'is-placeholder': ! isDataLoaded,
	} );

	if ( ! isDataLoaded ) {
		return <div className={ classes } />;
	}

	if ( isGenericReceipt ) {
		return <div />;
	}

	const shouldHideFeaturesHeading =
		hasFailedPurchases ||
		purchases?.some( isGSuiteOrExtraLicenseOrGoogleWorkspace ) ||
		purchases?.some( isDomainRegistration ) ||
		purchases?.some( isDomainMapping ) ||
		purchases?.some( isDomainTransfer ) ||
		purchases?.some( isTitanMail );

	if ( shouldHideFeaturesHeading ) {
		return <div />;
	}

	return <div className={ classes }>Purchase actions go here.</div>;
};

PurchaseActions.propTypes = {
	isDataLoaded: PropTypes.bool.isRequired,
	isGenericReceipt: PropTypes.bool,
	purchases: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.array ] ),
};

export default PurchaseActions;
