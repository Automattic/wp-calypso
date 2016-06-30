/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	isDomainMapping,
	isDomainRegistration,
	isGoogleApps,
	isGuidedTransfer,
} from 'lib/products-values';

const FeaturesHeader = ( { isDataLoaded, isGenericReceipt, purchases } ) => {
	const classes = classNames( 'checkout-thank-you__features-header', {
		'is-placeholder': ! isDataLoaded
	} );

	if ( ! isDataLoaded ) {
		return <div className={ classes } />;
	}

	if ( isGenericReceipt ) {
		return <div />;
	}

	const shouldHideFeaturesHeading = purchases.some( isGoogleApps ) ||
		purchases.some( isDomainRegistration ) ||
		purchases.some( isDomainMapping ) ||
		purchases.some( isGuidedTransfer );

	if ( shouldHideFeaturesHeading ) {
		return <div />;
	}

	return <div className={ classes }>{ i18n.translate( 'What now?' ) }</div>
};

FeaturesHeader.propTypes = {
	isDataLoaded: React.PropTypes.bool.isRequired,
	isGenericReceipt: React.PropTypes.bool,
	purchases: React.PropTypes.oneOfType( [
		React.PropTypes.bool,
		React.PropTypes.array
	] )
};

export default FeaturesHeader;
