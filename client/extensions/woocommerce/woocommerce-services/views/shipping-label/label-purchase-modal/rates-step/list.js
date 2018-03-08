/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import RateSelector from './rate-selector';
import getPackageDescriptions from '../packages-step/get-package-descriptions';

const renderRateNotice = ( translate ) => {
	return (
		<Notice
			className="rates-step__notice"
			icon="info-outline"
			showDismiss={ false }
			text={ translate( 'The service and rate chosen by the customer at checkout is not available. Please choose another.' ) }
		/>
	);
};

export const ShippingRates = ( {
		siteId,
		orderId,
		id,
		selectedPackages,
		allPackages,
		shouldShowRateNotice,
		translate,
	} ) => {
	const packageNames = getPackageDescriptions( selectedPackages, allPackages, true );
	const hasSinglePackage = ( 1 === Object.keys( selectedPackages ).length );

	return (
		<div>
			{ shouldShowRateNotice && renderRateNotice( translate ) }
			{ map( selectedPackages, ( pckg, pckgId ) => (
				<RateSelector
					key={ pckgId }
					id={ id + '_' + pckgId }
					siteId={ siteId }
					orderId={ orderId }
					packageId={ pckgId }
					packageName={ hasSinglePackage ? null : packageNames[ pckgId ] }
				/>
			) ) }
		</div>
	);
};

ShippingRates.propTypes = {
	id: PropTypes.string.isRequired,
	selectedPackages: PropTypes.object.isRequired,
	allPackages: PropTypes.object.isRequired,
};

export default localize( ShippingRates );
