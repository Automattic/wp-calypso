/**
 * External dependencies
 */
import { forEach, isEmpty, mapValues } from 'lodash';

/**
 * Checks the address object for the required fields
 *
 * @param {object} address the address object
 * @returns {boolean} true if all required fields are not empty
 */
const addressFilled = ( address ) =>
	Boolean(
		address &&
			address.name &&
			address.address &&
			address.city &&
			address.postcode &&
			address.country
	);

/**
 * Parses the data passed from the backed into a Redux state to be used in the label purchase flow
 *
 * @param {object} data data to initialize the labels state from
 * @returns {object} labels Redux state
 */
export default ( data ) => {
	if ( ! data ) {
		return {
			loaded: false,
			isFetching: false,
			error: false,
		};
	}

	const { formData, labelsData, paperSize, storeOptions, canChangeCountries } = data;

	//old WCS required a phone number and detected normalization status based on the existence of the phone field
	//newer versions send the normalized flag
	const originNormalized = Boolean( formData.origin_normalized || formData.origin.phone );
	const hasOriginAddress = addressFilled( formData.origin );
	const hasDestinationAddress = addressFilled( formData.destination );

	const customsItemsData = {};
	forEach( formData.selected_packages, ( { items } ) => {
		items.map(
			( {
				product_id,
				weight,
				name,
				attributes,
				description,
				value,
				hs_tariff_number,
				origin_country,
			} ) => {
				const attributesStr = attributes ? ' (' + attributes + ')' : '';
				const defaultDescription = name.substring( name.indexOf( '-' ) + 1 ).trim() + attributesStr;
				customsItemsData[ product_id ] = {
					defaultDescription,
					description: description || defaultDescription,
					weight,
					value,
					tariffNumber: hs_tariff_number,
					originCountry: origin_country || formData.origin.country,
				};
			}
		);
	} );

	return {
		loaded: true,
		isFetching: false,
		error: false,
		refreshedLabelStatus: false,
		labels: labelsData || [],
		paperSize,
		storeOptions,
		fulfillOrder: true,
		emailDetails: true,
		form: {
			orderId: formData.order_id,
			origin: {
				values: formData.origin,
				isNormalized: originNormalized,
				normalized: originNormalized ? formData.origin : null,
				// If no origin address is stored, mark all fields as "ignore validation"
				// so the UI doesn't immediately show errors
				ignoreValidation: hasOriginAddress ? null : mapValues( formData.origin, () => true ),
				selectNormalized: true,
				normalizationInProgress: false,
				allowChangeCountry: Boolean( canChangeCountries ),
			},
			destination: {
				values: formData.destination,
				isNormalized: Boolean( formData.destination_normalized ),
				normalized: formData.destination_normalized ? formData.destination : null,
				// If no destination address is stored, mark all fields as "ignore validation"
				// so the UI doesn't immediately show errors
				ignoreValidation: hasDestinationAddress
					? null
					: mapValues( formData.destination, () => true ),
				selectNormalized: true,
				normalizationInProgress: false,
				allowChangeCountry: Boolean( canChangeCountries ),
			},
			packages: {
				all: formData.all_packages,
				flatRateGroups: formData.flat_rate_groups,
				selected: formData.selected_packages,
				isPacked: formData.is_packed,
				saved: true,
			},
			customs: {
				items: customsItemsData,
				// Ignore validation in the weight and value fields that are empty so the user doesn't see everything red from the start
				ignoreWeightValidation: mapValues(
					customsItemsData,
					( { weight } ) => ! weight || ! parseFloat( weight )
				),
				ignoreValueValidation: mapValues(
					customsItemsData,
					( { value } ) => ! value || ! parseFloat( value )
				),
			},
			rates: {
				values: isEmpty( formData.rates.selected )
					? mapValues( formData.packages, () => '' )
					: formData.rates.selected,
				available: {},
				retrievalInProgress: false,
			},
		},
		openedPackageId: Object.keys( formData.selected_packages )[ 0 ] || '',
	};
};
