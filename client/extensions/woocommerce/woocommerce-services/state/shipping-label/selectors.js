/**
 * External dependencies
 */
import { find, get, isEmpty, map, mapValues, sum } from 'lodash';
import { translate } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSelectedSiteId } from 'state/ui/selectors';
import { hasNonEmptyLeaves } from 'woocommerce/woocommerce-services/lib/utils/tree';
import { isValidPhone } from 'woocommerce/woocommerce-services/lib/utils/phone-format';

export const getShippingLabel = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	return get( state, [ 'extensions', 'woocommerce', 'woocommerceServices', siteId, 'shippingLabel', orderId ], null );
};

export const isLoaded = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	return shippingLabel && shippingLabel.loaded;
};

export const isEnabled = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	return shippingLabel && shippingLabel.enabled;
};

export const isFetching = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	return shippingLabel && shippingLabel.isFetching;
};

export const isError = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	return shippingLabel && shippingLabel.error;
};

export const getLabels = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	return shippingLabel && shippingLabel.loaded ? shippingLabel.labels : [];
};

export const shouldFulfillOrder = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	return shippingLabel && shippingLabel.fulfillOrder;
};

export const shouldEmailDetails = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	return shippingLabel && shippingLabel.emailDetails;
};

export const getSelectedPaymentMethod = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	if ( ! shippingLabel ) {
		return null;
	}

	return shippingLabel.paymentMethod;
};

export const getForm = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	return shippingLabel && shippingLabel.form;
};

export const getRatesTotal = createSelector(
	( state, orderId, siteId = getSelectedSiteId( state ) ) => {
		const form = getForm( state, orderId, siteId );
		if ( ! form ) {
			return 0;
		}

		const { values: selectedRates, available: availableRates } = form.rates;

		const ratesCost = map( selectedRates, ( rateId, boxId ) => {
			const packageRates = get( availableRates, [ boxId, 'rates' ], false );

			if ( packageRates ) {
				const foundRate = find( packageRates, [ 'service_id', rateId ] );

				return foundRate ? foundRate.rate : 0;
			}
			return 0;
		} );

		return Number( sum( ratesCost ) ).toFixed( 2 );
	},
	( state, orderId, siteId = getSelectedSiteId( state ) ) => {
		const form = getForm( state, orderId, siteId );
		return [ form && form.rates ];
	}
);

const getAddressErrors = ( { values, isNormalized, normalized, selectNormalized, ignoreValidation }, countriesData ) => {
	if ( isNormalized && ! normalized ) {
		// If the address is normalized but the server didn't return a normalized address, then it's
		// invalid and must register as an error
		return {
			address: translate( 'This address is not recognized. Please try another.' ),
		};
	}
	const { phone, postcode, state, country } = ( isNormalized && selectNormalized ) ? normalized : values;
	const requiredFields = [ 'name', 'phone', 'address', 'city', 'postcode', 'country' ];
	const errors = {};
	requiredFields.forEach( ( field ) => {
		if ( ! values[ field ] ) {
			errors[ field ] = translate( 'This field is required' );
		}
	} );

	if ( countriesData[ country ] ) {
		if ( ! isValidPhone( phone, country ) ) {
			errors.phone = translate( 'Invalid phone number for %(country)s', { args: { country: countriesData[ country ].name } } );
		}

		switch ( country ) {
			case 'US':
				if ( ! /^\d{5}(?:-\d{4})?$/.test( postcode ) ) {
					errors.postcode = translate( 'Invalid ZIP code format' );
				}
				break;
		}

		if ( ! isEmpty( countriesData[ country ].states ) && ! state ) {
			errors.state = translate( 'This field is required' );
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

const getPackagesErrors = ( values ) => mapValues( values, ( pckg ) => {
	const errors = {};

	if ( 'not_selected' === pckg.box_id ) {
		errors.box_id = translate( 'Please select a package' );
	}

	if ( ! pckg.weight || 'number' !== typeof pckg.weight || 0 > pckg.weight ) {
		errors.weight = translate( 'Invalid weight' );
	}

	return errors;
} );

export const getRatesErrors = ( { values: selectedRates, available: allRates } ) => {
	return {
		server: mapValues( allRates, ( rate ) => {
			if ( ! rate.errors ) {
				return;
			}

			return rate.errors.map( ( error ) =>
				error.userMessage ||
				error.message ||
				translate( "We couldn't get a rate for this package, please try again." )
			);
		} ),
		form: mapValues( selectedRates, ( ( rate ) => rate ? null : translate( 'Please choose a rate' ) ) ),
	};
};

const getSidebarErrors = ( paperSize ) => {
	const errors = {};
	if ( ! paperSize ) {
		errors.paperSize = translate( 'This field is required' );
	}
	return errors;
};

export const getFormErrors = createSelector(
	( state, orderId, siteId = getSelectedSiteId( state ) ) => { //( shippingLabel, countriesData ) => {
		if ( ! isLoaded( state, orderId, siteId ) ) {
			return {};
		}

		const shippingLabel = getShippingLabel( state, orderId, siteId );
		const { countriesData } = shippingLabel.storeOptions;
		const { form, paperSize } = shippingLabel;
		if ( isEmpty( form ) ) {
			return;
		}
		return {
			origin: getAddressErrors( form.origin, countriesData ),
			destination: getAddressErrors( form.destination, countriesData ),
			packages: getPackagesErrors( form.packages.selected ),
			rates: getRatesErrors( form.rates ),
			sidebar: getSidebarErrors( paperSize ),
		};
	},
	( state, orderId, siteId = getSelectedSiteId( state ) ) => [
		getShippingLabel( state, orderId, siteId ),
	]
);

export const canPurchase = createSelector(
	( state, orderId, siteId = getSelectedSiteId( state ) ) => {
		const errors = getFormErrors( state, orderId, siteId );
		const form = getForm( state, orderId, siteId );

		return (
			! isEmpty( form ) &&
			! hasNonEmptyLeaves( errors ) &&
			! form.origin.normalizationInProgress &&
			! form.destination.normalizationInProgress &&
			! form.rates.retrievalInProgress &&
			! isEmpty( form.rates.available )
		);
	},
	( state, orderId, siteId = getSelectedSiteId( state ) ) => [
		getFormErrors( state, orderId, siteId ),
		getForm( state, orderId, siteId ),
	]
);

