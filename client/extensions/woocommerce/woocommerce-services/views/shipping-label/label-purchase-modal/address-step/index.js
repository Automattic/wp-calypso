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
import AddressFields from './fields';
import { hasNonEmptyLeaves } from 'woocommerce/woocommerce-services/lib/utils/tree';
import StepContainer from '../step-container';
import { getFormErrors } from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import { toggleStep } from 'woocommerce/woocommerce-services/state/shipping-label/actions';

const renderSummary = ( {
		values,
		isNormalized,
		normalizationInProgress,
		normalized,
		selectNormalized,
		storeOptions,
		errors,
	}, showCountry ) => {
	if ( normalizationInProgress ) {
		return __( 'Validating address...' );
	}
	if ( hasNonEmptyLeaves( errors ) || ( isNormalized && ! normalized ) ) {
		return __( 'Invalid address' );
	}
	const { countriesData } = storeOptions;
	const { city, postcode, state, country } = ( normalized && selectNormalized ) ? normalized : values;
	// Summary format: "city, state postcode [, country]"
	let str = city + ', ';
	if ( state ) {
		const statesMap = ( countriesData[ country ] || {} ).states || {};
		str += ( statesMap[ state ] || state ) + ' ';
	}
	str += ( 'US' === country ? postcode.split( '-' )[ 0 ] : postcode );
	if ( showCountry ) {
		str += ', ' + countriesData[ country ].name;
	}
	return str;
};

const getNormalizationStatus = ( { normalizationInProgress, errors, isNormalized, values, normalized } ) => {
	if ( normalizationInProgress ) {
		return { isProgress: true };
	}
	if ( hasNonEmptyLeaves( errors ) || ( isNormalized && ! normalized ) ) {
		return { isError: true };
	}
	if ( isNormalized ) {
		return _.isEqual( values, normalized ) ? { isSuccess: true } : { isWarning: true };
	}
	return {};
};

const AddressStep = ( props ) => {
	const toggleStepHandler = () => props.toggleStep( props.type );
	return (
		<StepContainer
			title={ props.title }
			summary={ props.summary }
			expanded={ props.expanded }
			toggleStep={ toggleStepHandler }
			{ ...props.normalizationStatus } >
			<AddressFields group={ props.type } />
		</StepContainer>
	);
};

AddressStep.propTypes = {
	values: PropTypes.object.isRequired,
	isNormalized: PropTypes.bool.isRequired,
	normalized: PropTypes.object,
	normalizationInProgress: PropTypes.bool.isRequired,
	errors: PropTypes.oneOfType( [
		PropTypes.object,
		PropTypes.bool,
	] ).isRequired,
	toggleStep: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, ownProps ) => {
	const loaded = state.shippingLabel.loaded;
	const storeOptions = loaded ? state.shippingLabel.storeOptions : {};

	const form = state.shippingLabel.form[ ownProps.type ];
	const errors = loaded && getFormErrors( state, storeOptions )[ ownProps.type ];

	const showCountryInSummary = ownProps.type === 'destination' &&
		state.shippingLabel.form.origin.values.country !== form.values.country;

	return {
		errors,
		expanded: form.expanded,
		summary: renderSummary( { ...form, storeOptions, errors }, showCountryInSummary ),
		normalizationStatus: getNormalizationStatus( { ...form, errors } ),
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { toggleStep }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( AddressStep );
