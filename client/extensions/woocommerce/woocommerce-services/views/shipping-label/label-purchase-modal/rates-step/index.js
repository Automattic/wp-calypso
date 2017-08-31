/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { translate as __ } from 'i18n-calypso';
import _ from 'lodash';

/**
 * Internal dependencies
 */
import ShippingRates from './list';
import StepContainer from '../step-container';
import { hasNonEmptyLeaves } from 'lib/utils/tree';
import { getRatesTotal } from 'apps/shipping-label/state/selectors/rates';

const ratesSummary = ( selectedRates, availableRates, total, currencySymbol, packagesSaved ) => {
	if ( ! packagesSaved ) {
		return __( 'Unsaved changes made to packages' );
	}

	const packageIds = Object.keys( selectedRates );

	// Show the service name and cost when only one service/package exists
	if ( 1 === packageIds.length ) {
		const packageId = packageIds[ 0 ];
		const selectedRate = selectedRates[ packageId ];
		const packageRates = _.get( availableRates, [ packageId, 'rates' ], [] );
		const rateInfo = _.find( packageRates, [ 'service_id', selectedRate ] );

		if ( rateInfo ) {
			return __( '%(serviceName)s: %(currencySymbol)s%(rate).2f', {
				args: {
					serviceName: rateInfo.title,
					rate: rateInfo.rate,
					currencySymbol,
				},
			} );
		}

		return '';
	}

	// Otherwise, just show the total
	return __( 'Total rate: %(currencySymbol)s%(total)s', {
		args: {
			total,
			currencySymbol,
		},
	} );
};

const getRatesStatus = ( { retrievalInProgress, errors, available, form } ) => {
	if ( retrievalInProgress ) {
		return { isProgress: true };
	}

	if ( hasNonEmptyLeaves( errors ) ) {
		return { isError: true };
	}

	if ( _.isEmpty( available ) ) {
		return {};
	}

	if ( ! form.packages.saved ) {
		return { isWarning: true };
	}

	return { isSuccess: true };
};

const RatesStep = ( props ) => {
	const {
		form,
		values,
		available,
		storeOptions,
		labelActions,
		errors,
		expanded,
	} = props;
	const summary = ratesSummary( values, available, getRatesTotal( form.rates ), storeOptions.currency_symbol, form.packages.saved );

	const toggleStep = () => labelActions.toggleStep( 'rates' );
	return (
		<StepContainer
			title={ __( 'Rates' ) }
			summary={ summary }
			expanded={ expanded }
			toggleStep={ toggleStep }
			{ ...getRatesStatus( props ) } >
			<ShippingRates
				id="rates"
				showRateNotice={ false }
				selectedPackages={ form.packages.selected }
				allPackages={ form.packages.all }
				selectedRates={ values }
				availableRates={ available }
				updateRate={ labelActions.updateRate }
				currencySymbol={ storeOptions.currency_symbol }
				errors={ errors } />
		</StepContainer>
	);
};

RatesStep.propTypes = {
	form: PropTypes.object.isRequired,
	values: PropTypes.object.isRequired,
	available: PropTypes.object.isRequired,
	labelActions: PropTypes.object.isRequired,
	storeOptions: PropTypes.object.isRequired,
	errors: PropTypes.object.isRequired,
};

export default RatesStep;
