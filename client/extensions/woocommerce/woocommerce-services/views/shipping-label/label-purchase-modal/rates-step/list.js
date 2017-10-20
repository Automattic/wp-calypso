/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get, isEmpty, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import FieldError from 'woocommerce/woocommerce-services/components/field-error';
import Dropdown from 'woocommerce/woocommerce-services/components/dropdown';
import Notice from 'components/notice';
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
		id,
		selectedRates, // Store owner selected rates, not customer
		availableRates,
		selectedPackages,
		allPackages,
		updateRate,
		currencySymbol,
		errors,
		shouldShowRateNotice,
		translate,
	} ) => {
	const packageNames = getPackageDescriptions( selectedPackages, allPackages, true );
	const hasSinglePackage = ( 1 === Object.keys( selectedPackages ).length );
	const hasMultiplePackages = ( 1 < Object.keys( selectedPackages ).length );

	const getTitle = ( pckg, pckgId ) => {
		if ( hasSinglePackage ) {
			return translate( 'Choose rate' );
		}
		return translate( 'Choose rate: %(pckg)s', { args: { pckg: packageNames[ pckgId ] } } );
	};

	const renderSinglePackage = ( pckg, pckgId ) => {
		const selectedRate = selectedRates[ pckgId ] || '';
		const packageRates = get( availableRates, [ pckgId, 'rates' ], [] );
		const valuesMap = { '': translate( 'Select one…' ) };
		const serverErrors = errors.server && errors.server[ pckgId ];
		const formError = errors.form && errors.form[ pckgId ];

		packageRates.forEach( ( rateObject ) => {
			valuesMap[ rateObject.service_id ] = rateObject.title + ' (' + currencySymbol + Number( rateObject.rate ).toFixed( 2 ) + ')';
		} );

		const onRateUpdate = ( value ) => updateRate( pckgId, value );
		return (
			<div key={ pckgId } className="rates-step__package-container">
				{ serverErrors &&
					isEmpty( packageRates ) &&
					hasMultiplePackages &&
					<p className="rates-step__package-heading">{ packageNames[ pckgId ] }</p>
				}
				{ ! isEmpty( packageRates ) &&
					<Dropdown
						id={ id + '_' + pckgId }
						valuesMap={ valuesMap }
						title={ getTitle( pckg, pckgId ) }
						value={ selectedRate }
						updateValue={ onRateUpdate }
						error={ formError } />
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
			{ shouldShowRateNotice && renderRateNotice( translate ) }
			{ Object.values( mapValues( selectedPackages, renderSinglePackage ) ) }
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

export default localize( ShippingRates );
