import {
	isDomainMapping,
	isDomainRegistration,
	isDomainTransfer,
	isGSuiteOrExtraLicenseOrGoogleWorkspace,
	isTitanMail,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import i18n from 'i18n-calypso';
import PropTypes from 'prop-types';

const FeaturesHeader = ( { isDataLoaded, isGenericReceipt, purchases, hasFailedPurchases } ) => {
	const classes = classNames( 'checkout-thank-you__features-header', {
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
		purchases.some( isGSuiteOrExtraLicenseOrGoogleWorkspace ) ||
		purchases.some( isDomainRegistration ) ||
		purchases.some( isDomainMapping ) ||
		purchases.some( isDomainTransfer ) ||
		purchases.some( isTitanMail );

	if ( shouldHideFeaturesHeading ) {
		return <div />;
	}

	return <div className={ classes }>{ i18n.translate( 'What now?' ) }</div>;
};

FeaturesHeader.propTypes = {
	isDataLoaded: PropTypes.bool.isRequired,
	isGenericReceipt: PropTypes.bool,
	purchases: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.array ] ),
};

export default FeaturesHeader;
