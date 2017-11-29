/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import AddressFields from './fields';
import { hasNonEmptyLeaves } from 'woocommerce/woocommerce-services/lib/utils/tree';
import StepContainer from '../step-container';
import { toggleStep } from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	getShippingLabel,
	isLoaded,
	getFormErrors,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

const renderSummary = ( {
		values,
		isNormalized,
		normalizationInProgress,
		normalized,
		selectNormalized,
		storeOptions,
		errors,
		translate,
		expandStateName = false,
	}, showCountry ) => {
	if ( normalizationInProgress ) {
		return translate( 'Validating address…' );
	}
	if ( hasNonEmptyLeaves( errors ) || ( isNormalized && ! normalized ) ) {
		return translate( 'Invalid address' );
	}
	if ( ! isNormalized ) {
		return translate( "You've edited the address, please revalidate it for accurate rates" );
	}
	const { countriesData } = storeOptions;
	const { city, postcode, state, country } = ( normalized && selectNormalized ) ? normalized : values;
	// Summary format: "city, state  postcode [, country]"
	let str = city + ', ';
	if ( state ) {
		const statesMap = ( expandStateName && ( countriesData[ country ] || {} ).states ) || {};
		str += ( statesMap[ state ] || state ) + '\xa0 ';  // append two spaces: non-breaking and normal
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
	if ( hasNonEmptyLeaves( errors ) || ( isNormalized && ! normalized ) || ! isNormalized ) {
		return { isError: true };
	}
	if ( isNormalized ) {
		return isEqual( values, normalized ) ? { isSuccess: true } : { isWarning: true };
	}
	return {};
};

const AddressStep = ( props ) => {
	const toggleStepHandler = () => props.toggleStep( props.orderId, props.siteId, props.type );
	const { form, storeOptions, error, showCountryInSummary, translate } = props;

	return (
		<StepContainer
			title={ props.title }
			summary={ renderSummary( { ...form, storeOptions, errors: error, translate }, showCountryInSummary ) }
			expanded={ props.expanded }
			toggleStep={ toggleStepHandler }
			{ ...props.normalizationStatus } >
			<AddressFields group={ props.type } siteId={ props.siteId } orderId={ props.orderId } />
		</StepContainer>
	);
};

AddressStep.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	form: PropTypes.shape( {
		values: PropTypes.object.isRequired,
		isNormalized: PropTypes.bool.isRequired,
		normalized: PropTypes.object,
		normalizationInProgress: PropTypes.bool.isRequired,
	} ).isRequired,
	storeOptions: PropTypes.object.isRequired,
	errors: PropTypes.oneOfType( [
		PropTypes.object,
		PropTypes.bool,
	] ).isRequired,
	toggleStep: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId, type } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	const storeOptions = loaded ? shippingLabel.storeOptions : {};

	const form = shippingLabel.form[ type ];
	const errors = loaded && getFormErrors( state, orderId, siteId )[ type ];

	const showCountryInSummary = type === 'destination' &&
		shippingLabel.form.origin.values.country !== form.values.country;

	return {
		errors,
		form,
		storeOptions,
		showCountryInSummary,
		expanded: form.expanded,
		normalizationStatus: getNormalizationStatus( { ...form, errors } ),
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { toggleStep }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( AddressStep ) );
