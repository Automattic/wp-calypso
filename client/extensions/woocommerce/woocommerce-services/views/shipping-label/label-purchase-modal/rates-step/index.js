/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate as __ } from 'i18n-calypso';
import _ from 'lodash';

/**
 * Internal dependencies
 */
import ShippingRates from './list';
import StepContainer from '../step-container';
import { hasNonEmptyLeaves } from 'woocommerce/woocommerce-services/lib/utils/tree';

import { toggleStep, updateRate } from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	getShippingLabel,
	isLoaded,
	getFormErrors,
	getRatesTotal,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

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
		siteId,
		orderId,
		form,
		values,
		available,
		currencySymbol,
		errors,
		expanded,
		ratesTotal
	} = props;
	const summary = ratesSummary( values, available, ratesTotal, currencySymbol, form.packages.saved );

	const toggleStepHandler = () => props.toggleStep( orderId, siteId, 'rates' );
	const updateRateHandler = ( packageId, value ) => props.updateRate( orderId, siteId, packageId, value );
	return (
		<StepContainer
			title={ __( 'Rates' ) }
			summary={ summary }
			expanded={ expanded }
			toggleStep={ toggleStepHandler }
			{ ...getRatesStatus( props ) } >
			<ShippingRates
				id="rates"
				showRateNotice={ false }
				selectedPackages={ form.packages.selected }
				allPackages={ form.packages.all }
				selectedRates={ values }
				availableRates={ available }
				updateRate={ updateRateHandler }
				currencySymbol={ currencySymbol }
				errors={ errors } />
		</StepContainer>
	);
};

RatesStep.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	form: PropTypes.object.isRequired,
	values: PropTypes.object.isRequired,
	available: PropTypes.object.isRequired,
	currencySymbol: PropTypes.string.isRequired,
	errors: PropTypes.object.isRequired,
	toggleStep: PropTypes.func.isRequired,
	updateRate: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	const storeOptions = loaded ? shippingLabel.storeOptions : {};
	return {
		...shippingLabel.form.rates,
		form: shippingLabel.form,
		currencySymbol: storeOptions.currency_symbol,
		errors: loaded && getFormErrors( state, orderId, siteId ).rates,
		ratesTotal: getRatesTotal( state, orderId, siteId ),
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { toggleStep, updateRate }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( RatesStep );
