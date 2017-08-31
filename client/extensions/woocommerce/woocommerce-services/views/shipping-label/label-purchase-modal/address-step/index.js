/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { translate as __ } from 'i18n-calypso';
import _ from 'lodash';

/**
 * Internal dependencies
 */
import AddressFields from './fields';
import { hasNonEmptyLeaves } from 'lib/utils/tree';
import StepContainer from '../step-container';

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

const Origin = ( props ) => {
	const showCountryInSummary = false;
	const toggleStep = () => props.labelActions.toggleStep( 'origin' );
	return (
		<StepContainer
			title={ __( 'Origin address' ) }
			summary={ renderSummary( props, showCountryInSummary ) }
			expanded={ props.expanded }
			toggleStep={ toggleStep }
			{ ...getNormalizationStatus( props ) } >
			<AddressFields
				{ ...props }
				group="origin" />
		</StepContainer>
	);
};

const Destination = ( props ) => {
	const showCountryInSummary = props.form.origin.values.country !== props.values.country;
	const toggleStep = () => props.labelActions.toggleStep( 'destination' );
	return (
		<StepContainer
			title={ __( 'Destination address' ) }
			summary={ renderSummary( props, showCountryInSummary ) }
			expanded={ props.expanded }
			toggleStep={ toggleStep }
			{ ...getNormalizationStatus( props ) } >
			<AddressFields
				{ ...props }
				group="destination" />
		</StepContainer>
	);
};

Origin.propTypes = Destination.propTypes = {
	values: PropTypes.object.isRequired,
	isNormalized: PropTypes.bool.isRequired,
	normalized: PropTypes.object,
	selectNormalized: PropTypes.bool.isRequired,
	normalizationInProgress: PropTypes.bool.isRequired,
	allowChangeCountry: PropTypes.bool.isRequired,
	labelActions: PropTypes.object.isRequired,
	storeOptions: PropTypes.object.isRequired,
	errors: PropTypes.oneOfType( [
		PropTypes.object,
		PropTypes.bool,
	] ).isRequired,
};

export default {
	Origin,
	Destination,
};
