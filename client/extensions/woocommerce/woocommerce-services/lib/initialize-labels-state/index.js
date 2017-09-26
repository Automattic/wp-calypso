/**
 * External dependencies
 */
import { isEmpty, mapValues } from 'lodash';

/**
 * Parses the data passed from the backed into a Redux state to be used in the label purchase flow
 * @param {Object} formData form data
 * @param {Object} labelsData labels data
 * @param {string} paperSize selected paper size
 * @param {Object} storeOptions store options (weight/dimensions units etc)
 * @param {Number} paymentMethod selected payment method
 * @param {Number} numPaymentMethods number of payments methods stored with the jetpack master account
 * @returns {Object} labels Redux state
 */
export default ( formData, labelsData, paperSize, storeOptions, paymentMethod, numPaymentMethods ) => {
	if ( ! formData ) {
		return {
			loaded: false,
			isFetching: false,
			error: false,
		};
	}

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
		paymentMethod,
		numPaymentMethods,
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
				allowChangeCountry: false,
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
				allowChangeCountry: false,
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
