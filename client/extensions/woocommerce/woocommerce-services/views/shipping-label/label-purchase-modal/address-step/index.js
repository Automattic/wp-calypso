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
import getAddressValues from 'woocommerce/woocommerce-services/lib/utils/get-address-values';
import { getCountryName, getStateName } from 'woocommerce/state/sites/data/locations/selectors';

const renderSummary = (
	addressData,
	appState,
	siteId,
	errors,
	translate,
	showCountry,
	expandStateName = false
) => {
	const { isNormalized, normalizationInProgress, normalized } = addressData;

	if ( normalizationInProgress ) {
		return translate( 'Validating address…' );
	}
	if ( hasNonEmptyLeaves( errors ) || ( isNormalized && ! normalized ) ) {
		return ( errors && errors.general ) || translate( 'Invalid address' );
	}
	if ( ! isNormalized ) {
		return translate( "You've edited the address, please revalidate it for accurate rates" );
	}
	const { city, postcode, state, country } = getAddressValues( addressData );
	// Summary format: "city, state  postcode [, country]"
	let str = city + ', ';
	if ( state ) {
		const stateStr = expandStateName ? getStateName( appState, country, state, siteId ) : state;
		str += stateStr + '\xa0 '; // append two spaces: non-breaking and normal
	}
	str += 'US' === country ? postcode.split( '-' )[ 0 ] : postcode;
	if ( showCountry ) {
		str += ', ' + getCountryName( appState, country, siteId );
	}
	return str;
};

const getNormalizationStatus = ( {
	normalizationInProgress,
	errors,
	isNormalized,
	values,
	normalized,
} ) => {
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

	return (
		<StepContainer
			title={ props.title }
			summary={ props.summary }
			expanded={ props.expanded }
			toggleStep={ toggleStepHandler }
			{ ...props.normalizationStatus }
		>
			<AddressFields group={ props.type } siteId={ props.siteId } orderId={ props.orderId } />
		</StepContainer>
	);
};

AddressStep.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	type: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	summary: PropTypes.string.isRequired,
	expanded: PropTypes.bool,
	normalizationStatus: PropTypes.object.isRequired,
	toggleStep: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId, type, translate } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );

	const form = shippingLabel.form[ type ];
	const errors = loaded && getFormErrors( state, orderId, siteId )[ type ];

	const shouldShowCountryInSummary =
		type === 'destination' && shippingLabel.form.origin.values.country !== form.values.country;

	return {
		errors,
		form,
		expanded: form.expanded,
		normalizationStatus: getNormalizationStatus( { ...form, errors } ),
		summary: renderSummary( form, state, siteId, errors, translate, shouldShowCountryInSummary ),
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { toggleStep }, dispatch );
};

export default localize( connect( mapStateToProps, mapDispatchToProps )( AddressStep ) );
