/** @format */

/**
 * External dependencies
 */
import {
	fill,
	find,
	flatten,
	forEach,
	get,
	includes,
	isEmpty,
	isEqual,
	isFinite,
	isNil,
	map,
	mapValues,
	omit,
	pick,
	round,
	some,
	uniq,
	zipObject,
} from 'lodash';
import { translate } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSelectedSiteId } from 'state/ui/selectors';
import { hasNonEmptyLeaves } from 'woocommerce/woocommerce-services/lib/utils/tree';
import {
	areSettingsLoaded,
	areSettingsErrored,
} from 'woocommerce/woocommerce-services/state/label-settings/selectors';
import {
	isLoaded as arePackagesLoaded,
	isFetchError as arePackagesErrored,
} from 'woocommerce/woocommerce-services/state/packages/selectors';
import getAddressValues from 'woocommerce/woocommerce-services/lib/utils/get-address-values';
import {
	ACCEPTED_USPS_ORIGIN_COUNTRIES,
	US_MILITARY_STATES,
	DOMESTIC_US_TERRITORIES,
	USPS_ITN_REQUIRED_DESTINATIONS,
} from './constants';
import {
	areLocationsLoaded,
	areLocationsErrored,
	getCountryName,
	_getSelectorDependants,
	getAllCountries,
	getStates,
	hasStates,
} from 'woocommerce/state/sites/data/locations/selectors';
import { isWcsInternationalLabelsEnabled } from 'woocommerce/state/selectors/plugins';

export const getShippingLabel = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	return get(
		state,
		[ 'extensions', 'woocommerce', 'woocommerceServices', siteId, 'shippingLabel', orderId ],
		null
	);
};

export const isLoaded = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	return shippingLabel && shippingLabel.loaded;
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

export const hasRefreshedLabelStatus = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	return shippingLabel && shippingLabel.refreshedLabelStatus;
};

export const getForm = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	return shippingLabel && shippingLabel.form;
};

/**
 * Returns a breakdown of the total price for selected labels in form of { prices, discount, total }
 * @param {Object} state global state tree
 * @param {Number} orderId order Id
 * @param {Number} siteId site Id
 *
 * @returns {Object} price breakdown
 */
export const getTotalPriceBreakdown = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const form = getForm( state, orderId, siteId );
	if ( ! form ) {
		return null;
	}

	const { values: selectedRates, available: availableRates } = form.rates;
	const prices = [];
	let discount = 0;
	let total = 0;
	for ( const packageId in selectedRates ) {
		const packageRates = get( availableRates, [ packageId, 'rates' ], false );
		const foundRate = find( packageRates, [ 'service_id', selectedRates[ packageId ] ] );
		if ( foundRate ) {
			prices.push( {
				title: foundRate.title,
				retailRate: foundRate.retail_rate,
			} );

			discount += round( foundRate.retail_rate - foundRate.rate, 2 );
			total += foundRate.rate;
		}
	}

	return prices.length
		? {
				prices,
				discount: discount,
				total: total,
		  }
		: null;
};

export const isCustomsFormRequired = createSelector(
	( state, orderId, siteId = getSelectedSiteId( state ) ) => {
		const form = getForm( state, orderId, siteId );
		if ( isEmpty( form ) ) {
			return false;
		}
		const origin = getAddressValues( form.origin );
		const destination = getAddressValues( form.destination );

		// Special case: Any shipment from/to military addresses must have Customs
		if ( 'US' === origin.country && includes( US_MILITARY_STATES, origin.state ) ) {
			return true;
		}
		if ( 'US' === destination.country && includes( US_MILITARY_STATES, destination.state ) ) {
			return true;
		}
		// No need to have Customs if shipping inside the same territory (for example, from Guam to Guam)
		if ( origin.country === destination.country ) {
			return false;
		}
		// Shipments between US, Puerto Rico and Virgin Islands don't need Customs, everything else does
		return (
			! includes( DOMESTIC_US_TERRITORIES, origin.country ) ||
			! includes( DOMESTIC_US_TERRITORIES, destination.country )
		);
	},
	( state, orderId, siteId = getSelectedSiteId( state ) ) => [ getForm( state, orderId, siteId ) ]
);

const getAddressErrors = ( addressData, appState, siteId, shouldValidatePhone = false ) => {
	const {
		values,
		isNormalized,
		isUnverifiable,
		normalized: normalizedValues,
		ignoreValidation,
		fieldErrors,
	} = addressData;
	if ( ( isNormalized || isUnverifiable ) && ! normalizedValues && fieldErrors ) {
		return fieldErrors;
	} else if ( isNormalized && ! normalizedValues ) {
		// If the address is normalized but the server didn't return a normalized address, then it's
		// invalid and must register as an error
		return {
			address: translate( 'This address is not recognized. Please try another.' ),
		};
	}

	const { phone, postcode, state, country } = getAddressValues( addressData );
	const requiredFields = [ 'name', 'address', 'city', 'postcode', 'country' ];
	const errors = {};
	requiredFields.forEach( field => {
		if ( ! values[ field ] ) {
			errors[ field ] = translate( 'This field is required' );
		}
	} );

	if (
		includes( ACCEPTED_USPS_ORIGIN_COUNTRIES, country ) &&
		! /^\d{5}(?:-\d{4})?$/.test( postcode )
	) {
		errors.postcode = translate( 'Invalid ZIP code format' );
	}

	if ( ! state && hasStates( appState, country, siteId ) ) {
		errors.state = translate( 'This field is required' );
	}

	if ( shouldValidatePhone ) {
		// EasyPost requires an origin phone number for international shipments.
		// This validation ensures that EasyPost will accept it, even though the phone may be invalid.
		if ( ! phone ) {
			errors.phone = translate(
				'Please enter a phone number for your origin address. ' +
					"It's required because this shipment requires a customs form."
			);
		} else if (
			10 !==
			phone
				.split( /\D+/g )
				.join( '' )
				.replace( /^1/, '' ).length
		) {
			errors.phone = translate(
				'Customs forms require a 10-digit phone number. ' +
					'Please edit your phone number so it has at most 10 digits.'
			);
		}
	}

	if ( ignoreValidation ) {
		Object.keys( errors ).forEach( field => {
			if ( ignoreValidation[ field ] ) {
				delete errors[ field ];
			}
		} );
	}

	return errors;
};

const getPackagesErrors = values =>
	mapValues( values, pckg => {
		const errors = {};

		if ( 'not_selected' === pckg.box_id ) {
			errors.box_id = translate( 'Please select a package' );
		}

		const isInvalidDimension = dimension => ! isFinite( dimension ) || 0 >= dimension;

		if ( isInvalidDimension( pckg.weight ) ) {
			errors.weight = translate( 'Invalid weight' );
		}

		const hasInvalidDimensions = some(
			[ pckg.length, pckg.width, pckg.height ],
			isInvalidDimension
		);
		if ( hasInvalidDimensions ) {
			errors.dimensions = translate( 'Package dimensions must be greater than zero' );
		}

		return errors;
	} );

export const getCustomsErrors = (
	packages,
	customs,
	destinationCountryCode,
	destinationCountryName
) => {
	const usedProductIds = uniq(
		flatten( map( packages, pckg => map( pckg.items, 'product_id' ) ) )
	);

	const valuesByProductId = zipObject( usedProductIds, fill( Array( usedProductIds.length ), 0 ) );
	forEach( packages, pckg => {
		forEach(
			pckg.items,
			( { quantity, product_id } ) =>
				( valuesByProductId[ product_id ] += quantity * customs.items[ product_id ].value )
		);
	} );

	const valuesByTariffNumber = {};
	forEach( pick( customs.items, usedProductIds ), ( itemData, productId ) => {
		if ( 6 === itemData.tariffNumber.length ) {
			if ( ! valuesByTariffNumber[ itemData.tariffNumber ] ) {
				valuesByTariffNumber[ itemData.tariffNumber ] = 0;
			}
			valuesByTariffNumber[ itemData.tariffNumber ] += valuesByProductId[ productId ];
		}
	} );

	return {
		packages: mapValues( packages, pckg => {
			const errors = {};

			if ( 'other' === pckg.contentsType && ! pckg.contentsExplanation ) {
				errors.contentsExplanation = translate(
					'Please describe what kind of goods this package contains'
				);
			}

			if ( 'other' === pckg.restrictionType && ! pckg.restrictionComments ) {
				errors.restrictionComments = translate(
					'Please describe what kind of restrictions this package must have'
				);
			}

			const classesAbove2500usd = new Set();
			forEach( pckg.items, ( { product_id } ) => {
				const { tariffNumber } = customs.items[ product_id ];
				if ( 2500 < valuesByTariffNumber[ tariffNumber ] ) {
					classesAbove2500usd.add( tariffNumber );
				}
			} );

			if ( pckg.itn ) {
				if ( ! /^(AES X\d{14})|(NOEEI 30\.\d{1,2}(\([a-z]\)(\(\d\))?)?)$/.test( pckg.itn ) ) {
					errors.itn = translate( 'Invalid format' );
				}
			} else if ( 'CA' !== destinationCountryCode ) {
				if ( ! isEmpty( classesAbove2500usd ) ) {
					errors.itn = translate(
						'International Transaction Number is required for shipping items valued over $2,500 per tariff code. ' +
							'Products with tariff code %(code)s add up to more than $2,500.',
						{
							args: { code: classesAbove2500usd.values().next().value }, // Just pick the first code
						}
					);
				} else if ( includes( USPS_ITN_REQUIRED_DESTINATIONS, destinationCountryCode ) ) {
					errors.itn = translate(
						'International Transaction Number is required for shipments to %(country)s',
						{
							args: { country: destinationCountryName },
						}
					);
				}
			}

			return errors;
		} ),

		items: mapValues( pick( customs.items, usedProductIds ), ( itemData, productId ) => {
			const itemErrors = {};
			if ( ! itemData.description ) {
				itemErrors.description = translate( 'This field is required' );
			}
			if ( ! customs.ignoreWeightValidation[ productId ] ) {
				if ( isNil( itemData.weight ) || '' === itemData.weight ) {
					itemErrors.weight = translate( 'This field is required' );
				} else if ( ! ( parseFloat( itemData.weight ) > 0 ) ) {
					itemErrors.weight = translate( 'Weight must be greater than zero' );
				}
			}
			if ( ! customs.ignoreValueValidation[ productId ] ) {
				if ( isNil( itemData.value ) || '' === itemData.value ) {
					itemErrors.value = translate( 'This field is required' );
				} else if ( ! ( parseFloat( itemData.value ) > 0 ) ) {
					itemErrors.value = translate( 'Declared value must be greater than zero' );
				}
			}
			if (
				! customs.ignoreTariffNumberValidation[ productId ] &&
				6 !== itemData.tariffNumber.length
			) {
				itemErrors.tariffNumber = translate( 'The tariff code must be 6 digits long' );
			}
			return itemErrors;
		} ),
	};
};

export const getRatesErrors = ( { values: selectedRates, available: allRates } ) => {
	return {
		server: mapValues( allRates, rate => {
			if ( ! rate.errors ) {
				return;
			}

			return rate.errors.map(
				error =>
					error.userMessage ||
					error.message ||
					translate( "We couldn't get a rate for this package, please try again." )
			);
		} ),
		form: mapValues( selectedRates, rate => ( rate ? null : translate( 'Please choose a rate' ) ) ),
	};
};

const getSidebarErrors = paperSize => {
	const errors = {};
	if ( ! paperSize ) {
		errors.paperSize = translate( 'This field is required' );
	}
	return errors;
};

export const getFormErrors = createSelector(
	( state, orderId, siteId = getSelectedSiteId( state ) ) => {
		if ( ! isLoaded( state, orderId, siteId ) ) {
			return {};
		}

		const shippingLabel = getShippingLabel( state, orderId, siteId );
		const { form, paperSize } = shippingLabel;
		if ( isEmpty( form ) ) {
			return {};
		}
		const destinationCountryCode = form.destination.values.country;
		const destinationCountryName = getCountryName( state, destinationCountryCode, siteId );
		const shouldValidateOriginPhone = isCustomsFormRequired( state, orderId, siteId );
		return {
			origin: getAddressErrors( form.origin, state, siteId, shouldValidateOriginPhone ),
			destination: getAddressErrors( form.destination, state, siteId ),
			packages: getPackagesErrors( form.packages.selected ),
			customs: getCustomsErrors(
				form.packages.selected,
				form.customs,
				destinationCountryCode,
				destinationCountryName
			),
			rates: getRatesErrors( form.rates ),
			sidebar: getSidebarErrors( paperSize ),
		};
	},
	( state, orderId, siteId = getSelectedSiteId( state ) ) => [
		getShippingLabel( state, orderId, siteId ),
	]
);

export const isCustomsFormStepSubmitted = (
	state,
	orderId,
	siteId = getSelectedSiteId( state )
) => {
	const form = getForm( state, orderId, siteId );
	if ( ! form ) {
		return false;
	}

	const usedProductIds = uniq(
		flatten( map( form.packages.selected, pckg => map( pckg.items, 'product_id' ) ) )
	);
	return ! some(
		usedProductIds.map(
			productId =>
				form.customs.ignoreTariffNumberValidation[ productId ] ||
				form.customs.ignoreWeightValidation[ productId ] ||
				form.customs.ignoreValueValidation[ productId ]
		)
	);
};

/**
 * Checks the form for errors and returns a step with an error in it or null
 * @param {Object} state global state tree
 * @param {Object} orderId order Id
 * @param {Object} siteId site Id
 *
 * @returns {String} erroneous step name or null
 */
export const getFirstErroneousStep = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const form = getForm( state, orderId, siteId );
	if ( ! form ) {
		return null;
	}

	const errors = getFormErrors( state, orderId, siteId );

	if (
		! form.origin.isNormalized ||
		! isEqual( form.origin.values, form.origin.normalized ) ||
		hasNonEmptyLeaves( errors.origin )
	) {
		return 'origin';
	}

	if (
		! form.destination.isNormalized ||
		! isEqual( form.destination.values, form.destination.normalized ) ||
		hasNonEmptyLeaves( errors.destination )
	) {
		return 'destination';
	}

	if ( hasNonEmptyLeaves( errors.packages ) ) {
		return 'packages';
	}

	if (
		isCustomsFormRequired( state, orderId, siteId ) &&
		( hasNonEmptyLeaves( errors.customs ) ||
			! isCustomsFormStepSubmitted( state, orderId, siteId ) )
	) {
		return 'customs';
	}

	if ( hasNonEmptyLeaves( errors.rates ) ) {
		return 'rates';
	}

	return null;
};

export const canPurchase = createSelector(
	( state, orderId, siteId = getSelectedSiteId( state ) ) => {
		const form = getForm( state, orderId, siteId );

		return (
			! isEmpty( form ) &&
			! getFirstErroneousStep( state, orderId, siteId ) &&
			! form.origin.normalizationInProgress &&
			! form.destination.normalizationInProgress &&
			! form.rates.retrievalInProgress &&
			! isEmpty( form.rates.available )
		);
	},
	( state, orderId, siteId = getSelectedSiteId( state ) ) => [
		getForm( state, orderId, siteId ),
		getFirstErroneousStep( state, orderId, siteId ),
	]
);

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} Map with the pairs { countryCode: countryName } of all the countries in the world
 */
export const getAllCountryNames = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		const countries = getAllCountries( state, siteId );
		const names = {};
		countries.forEach( ( { code, name } ) => ( names[ code ] = name ) );
		return names;
	},
	_getSelectorDependants( 0 )
);

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} Map with the pairs { countryCode: countryName } of countries that are available as origin to print shipping labels
 */
export const getOriginCountryNames = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		const allNames = getAllCountryNames( state, siteId );
		return isWcsInternationalLabelsEnabled( state, siteId )
			? pick( allNames, ACCEPTED_USPS_ORIGIN_COUNTRIES )
			: pick( allNames, DOMESTIC_US_TERRITORIES );
	},
	_getSelectorDependants( 0 )
);

/**
 * @param {Object} state Whole Redux state tree
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object} Map with the pairs { countryCode: countryName } of countries that are available as destination to print shipping labels
 */
export const getDestinationCountryNames = createSelector(
	( state, siteId = getSelectedSiteId( state ) ) => {
		const allNames = getAllCountryNames( state, siteId );
		return isWcsInternationalLabelsEnabled( state, siteId )
			? allNames
			: pick( allNames, DOMESTIC_US_TERRITORIES );
	},
	_getSelectorDependants( 0 )
);

/**
 * @param {Object} state Whole Redux state tree
 * @param {String} countryCode 2-letter ISO country code
 * @param {String} stateCode 2-letter code of the country's state
 * @param {Number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @return {Object|null} Map with the form { stateCode: stateName } with all the states of the given country, or null if
 * the country doesn't have a list of states
 */
export const getStateNames = createSelector(
	( state, countryCode, siteId = getSelectedSiteId( state ) ) => {
		if ( ! hasStates( state, countryCode, siteId ) ) {
			return null;
		}
		const states = getStates( state, countryCode, siteId );
		const names = {};
		states.forEach( ( { code, name } ) => ( names[ code ] = name ) );

		if ( 'US' === countryCode && ! isWcsInternationalLabelsEnabled( state, siteId ) ) {
			// Filter out military addresses
			return omit( names, US_MILITARY_STATES );
		}
		return names;
	},
	_getSelectorDependants( 1 )
);

export const areLabelsFullyLoaded = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	return (
		isLoaded( state, orderId, siteId ) &&
		areSettingsLoaded( state, siteId ) &&
		arePackagesLoaded( state, siteId ) &&
		areLocationsLoaded( state, siteId )
	);
};

export const isLabelDataFetchError = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	return (
		isError( state, orderId, siteId ) ||
		areSettingsErrored( state, siteId ) ||
		arePackagesErrored( state, siteId ) ||
		areLocationsErrored( state, siteId )
	);
};
