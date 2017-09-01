/**
 * External dependencies
 */
import { createSelector } from 'reselect'; // TODO refactor to use lib/create-selector and uninstall reselect
import { translate as __ } from 'i18n-calypso';
import _ from 'lodash';

/**
 * Internal dependencies
 */
import { isValidPhone } from '../../../lib/utils/phone-format';

const getAddressErrors = ( { values, isNormalized, normalized, selectNormalized, ignoreValidation }, countriesData ) => {
	if ( isNormalized && ! normalized ) {
		// If the address is normalized but the server didn't return a normalized address, then it's
		// invalid and must register as an error
		return {
			address: __( 'This address is not recognized. Please try another.' ),
		};
	}
	const { phone, postcode, state, country } = ( isNormalized && selectNormalized ) ? normalized : values;
	const requiredFields = [ 'name', 'phone', 'address', 'city', 'postcode', 'country' ];
	const errors = {};
	requiredFields.forEach( ( field ) => {
		if ( ! values[ field ] ) {
			errors[ field ] = __( 'This field is required' );
		}
	} );

	if ( countriesData[ country ] ) {
		if ( ! isValidPhone( phone, country ) ) {
			errors.phone = __( 'Invalid phone number for %(country)s', { args: { country: countriesData[ country ].name } } );
		}

		switch ( country ) {
			case 'US':
				if ( ! /^\d{5}(?:-\d{4})?$/.test( postcode ) ) {
					errors.postcode = __( 'Invalid ZIP code format' );
				}
				break;
		}

		if ( ! _.isEmpty( countriesData[ country ].states ) && ! state ) {
			errors.state = __( 'This field is required' );
		}
	}

	if ( ignoreValidation ) {
		Object.keys( errors ).forEach( ( field ) => {
			if ( ignoreValidation[ field ] ) {
				delete errors[ field ];
			}
		} );
	}

	return errors;
};

const getPackagesErrors = ( values ) => _.mapValues( values, ( pckg ) => {
	const errors = {};

	if ( 'not_selected' === pckg.box_id ) {
		errors.box_id = __( 'Please select a package' );
	}

	if ( ! pckg.weight || 'number' !== typeof pckg.weight || 0 > pckg.weight ) {
		errors.weight = __( 'Invalid weight' );
	}

	return errors;
} );

export const getRatesErrors = ( { values: selectedRates, available: allRates } ) => {
	return {
		server: _.mapValues( allRates, ( rate ) => {
			if ( ! rate.errors ) {
				return;
			}

			return rate.errors.map( ( error ) =>
				error.userMessage ||
				error.message ||
				__( "We couldn't get a rate for this package, please try again." )
			);
		} ),
		form: _.mapValues( selectedRates, ( ( rate ) => rate ? null : __( 'Please choose a rate' ) ) ),
	};
};

const getSidebarErrors = ( paperSize ) => {
	const errors = {};
	if ( ! paperSize ) {
		errors.paperSize = __( 'This field is required' );
	}
	return errors;
};

export default createSelector(
	( state ) => state.shippingLabel,
	( state, { countriesData } ) => countriesData,
	( shippingLabel, countriesData ) => {
		const { form, paperSize } = shippingLabel;
		if ( _.isEmpty( form ) ) {
			return;
		}
		return {
			origin: getAddressErrors( form.origin, countriesData ),
			destination: getAddressErrors( form.destination, countriesData ),
			packages: getPackagesErrors( form.packages.selected ),
			rates: getRatesErrors( form.rates ),
			sidebar: getSidebarErrors( paperSize ),
		};
	}
);
