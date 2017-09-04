/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { translate as __ } from 'i18n-calypso';
import _ from 'lodash';

/**
 * Internal dependencies
 */
import FieldError from 'woocommerce/woocommerce-services/components/field-error';
//import Dropdown from 'components/dropdown';
import Notice from 'components/notice';
import getPackageDescriptions from '../packages-step/get-package-descriptions';

const renderRateNotice = () => {
	return (
		<Notice
			className="rates-step__notice"
			icon="info-outline"
			showDismiss={ false }
			text={ __( 'The service and rate chosen by the customer at checkout is not available. Please choose another.' ) }
		/>
	);
};

const ShippingRates = ( {
		// id,
		// selectedRates, // Store owner selected rates, not customer
		availableRates,
		selectedPackages,
		allPackages,
		// updateRate,
		currencySymbol,
		errors,
		shouldShowRateNotice,
	} ) => {
	const packageNames = getPackageDescriptions( selectedPackages, allPackages, true );
	// const hasSinglePackage = ( 1 === Object.keys( selectedPackages ).length );
	const hasMultiplePackages = ( 1 < Object.keys( selectedPackages ).length );

	// const getTitle = ( pckg, pckgId ) => {
	// 	if ( hasSinglePackage ) {
	// 		return __( 'Choose rate' );
	// 	}
	// 	return __( 'Choose rate: %(pckg)s', { args: { pckg: packageNames[ pckgId ] } } );
	// };

	const renderSinglePackage = ( pckg, pckgId ) => {
		// const selectedRate = selectedRates[ pckgId ] || '';
		const packageRates = _.get( availableRates, [ pckgId, 'rates' ], [] );
		const valuesMap = { '': __( 'Select one...' ) };
		const serverErrors = errors.server && errors.server[ pckgId ];
		// const formError = errors.form && errors.form[ pckgId ];

		packageRates.forEach( ( rateObject ) => {
			valuesMap[ rateObject.service_id ] = rateObject.title + ' (' + currencySymbol + Number( rateObject.rate ).toFixed( 2 ) + ')';
		} );

		// const onRateUpdate = ( value ) => updateRate( pckgId, value );
		// { ! _.isEmpty( packageRates ) &&
		// 	<Dropdown
		// 		id={ id + '_' + pckgId }
		// 		valuesMap={ valuesMap }
		// 		title={ getTitle( pckg, pckgId ) }
		// 		value={ selectedRate }
		// 		updateValue={ onRateUpdate }
		// 		error={ formError } />
		// }
		return (
			<div key={ pckgId } className="rates-step__package-container">
				{ serverErrors &&
					_.isEmpty( packageRates ) &&
					hasMultiplePackages &&
					<p className="rates-step__package-heading">{ packageNames[ pckgId ] }</p>
				}

				{ serverErrors && serverErrors.map( ( serverError, index ) => {
					return <FieldError
						type="server-error"
						key={ index }
						text={ serverError } />;
				} ) }
			</div>
		);
	};

	return (
		<div>
			{ shouldShowRateNotice && renderRateNotice() }
			{ Object.values( _.mapValues( selectedPackages, renderSinglePackage ) ) }
		</div>
	);
};

ShippingRates.propTypes = {
	id: PropTypes.string.isRequired,
	selectedRates: PropTypes.object.isRequired,
	availableRates: PropTypes.object.isRequired,
	selectedPackages: PropTypes.object.isRequired,
	allPackages: PropTypes.object.isRequired,
	updateRate: PropTypes.func.isRequired,
	currencySymbol: PropTypes.string.isRequired,
	errors: PropTypes.object.isRequired,
};

export default ShippingRates;
