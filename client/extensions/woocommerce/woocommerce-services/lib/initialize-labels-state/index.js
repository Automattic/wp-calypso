/**
 * External dependencies
 */
import { isEmpty, mapValues } from 'lodash';

/**
 * Parses the data passed from the backed into a Redux state to be used in the label purchase flow
 * @param {Object} data data to initialize the labels state from
 * @returns {Object} labels Redux state
 */
export default ( data ) => {
	if ( ! data ) {
		return {
			loaded: false,
			isFetching: false,
			error: false,
		};
	}

	const {
		formData,
		labelsData,
		paperSize,
		storeOptions,
		canChangeCountries,
	} = data;

	// The phone field is never prefilled, so if it's present it means the address is fully valid
	const hasOriginAddress = Boolean( formData.origin.phone );
	const hasDestinationAddress = Boolean( formData.destination.phone );

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
				isNormalized: hasOriginAddress,
				normalized: hasOriginAddress ? formData.origin : null,
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
				ignoreValidation: hasDestinationAddress ? null : mapValues( formData.destination, () => true ),
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
