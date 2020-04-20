/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { isEqual, isObject, size } from 'lodash';

/**
 * Internal dependencies
 */
import TextField from 'woocommerce/woocommerce-services/components/text-field';
import Notice from 'components/notice';
import FormButton from 'components/forms/form-button';
import Dropdown from 'woocommerce/woocommerce-services/components/dropdown';
import { hasNonEmptyLeaves } from 'woocommerce/woocommerce-services/lib/utils/tree';
import AddressSuggestion from './suggestion';
import UnverifiedAddress from './unverified';
import { decodeEntities } from 'lib/formatting';
import {
	selectNormalizedAddress,
	confirmAddressSuggestion,
	editAddress,
	editUnverifiableAddress,
	updateAddressValue,
	submitAddressForNormalization,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	getShippingLabel,
	isLoaded,
	getFormErrors,
	isAddressUsable,
	getOriginCountryNames,
	getDestinationCountryNames,
	getStateNames,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import { getCountryName } from 'woocommerce/state/sites/data/locations/selectors';

const AddressFields = ( props ) => {
	const {
		siteId,
		orderId,
		values,
		isNormalized,
		normalized,
		selectNormalized,
		normalizationInProgress,
		allowChangeCountry,
		group,
		countryNames,
		stateNames,
		errors,
		isUsable,
		translate,
	} = props;

	const fieldErrors = isObject( errors ) ? errors : {};

	const confirmAddressSuggestionHandler = () =>
		props.confirmAddressSuggestion( orderId, siteId, group );

	if ( isNormalized && ! fieldErrors.phone ) {
		//                 ^^ Special case: The "phone" field can be made invalid by other step
		// (changing the Destination address to a foreign country, since that makes the origin phone required),
		// so even if the origin address was correctly normalized, the form needs to be displayed again
		if ( normalized && ! isEqual( normalized, values ) ) {
			const editAddressHandler = () => props.editAddress( orderId, siteId, group );
			const selectNormalizedAddressHandler = ( select ) =>
				props.selectNormalizedAddress( orderId, siteId, group, select );

			return (
				<AddressSuggestion
					values={ values }
					normalized={ normalized }
					selectNormalized={ selectNormalized }
					selectNormalizedAddress={ selectNormalizedAddressHandler }
					confirmAddressSuggestion={ confirmAddressSuggestionHandler }
					editAddress={ editAddressHandler }
					countryNames={ countryNames }
				/>
			);
		}

		if ( 0 < size( fieldErrors ) ) {
			const editUnverifiableAddressHandler = () =>
				props.editUnverifiableAddress( orderId, siteId, group );

			return (
				<UnverifiedAddress
					values={ values }
					confirmAddressSuggestion={ confirmAddressSuggestionHandler }
					editUnverifiableAddress={ editUnverifiableAddressHandler }
					countryNames={ countryNames }
					fieldErrors={ fieldErrors }
				/>
			);
		}
	}

	const generalErrorOnly = fieldErrors.general && size( fieldErrors ) === 1;
	const getId = ( fieldName ) => group + '_' + fieldName;
	const getValue = ( fieldName ) =>
		values[ fieldName ] ? decodeEntities( values[ fieldName ] ) : '';
	const updateValue = ( fieldName ) => ( newValue ) =>
		props.updateAddressValue( orderId, siteId, group, fieldName, newValue );
	const submitAddressForNormalizationHandler = () =>
		props.submitAddressForNormalization( orderId, siteId, group );

	return (
		<div>
			<TextField
				id={ getId( 'name' ) }
				title={ translate( 'Name' ) }
				value={ getValue( 'name' ) }
				updateValue={ updateValue( 'name' ) }
				error={ fieldErrors.name }
			/>
			<div className="address-step__company-phone">
				<TextField
					id={ getId( 'company' ) }
					title={ translate( 'Company' ) }
					value={ getValue( 'company' ) }
					updateValue={ updateValue( 'company' ) }
					className="address-step__company"
					error={ fieldErrors.company }
				/>
				<TextField
					id={ getId( 'phone' ) }
					title={ translate( 'Phone' ) }
					value={ getValue( 'phone' ) }
					updateValue={ updateValue( 'phone' ) }
					className="address-step__phone"
					error={ fieldErrors.phone }
				/>
			</div>
			{ generalErrorOnly && (
				<Notice status="is-error" showDismiss={ false }>
					{ translate( '%(message)s. Please modify the address and try again.', {
						args: { message: fieldErrors.general },
					} ) }
				</Notice>
			) }
			<TextField
				id={ getId( 'address' ) }
				title={ translate( 'Address' ) }
				value={ getValue( 'address' ) }
				updateValue={ updateValue( 'address' ) }
				className="address-step__address-1"
				error={ fieldErrors.address || generalErrorOnly }
			/>
			<TextField
				id={ getId( 'address_2' ) }
				value={ getValue( 'address_2' ) }
				updateValue={ updateValue( 'address_2' ) }
				error={ fieldErrors.address_2 || generalErrorOnly }
			/>
			<div className="address-step__city-state-postal-code">
				<TextField
					id={ getId( 'city' ) }
					title={ translate( 'City' ) }
					value={ getValue( 'city' ) }
					updateValue={ updateValue( 'city' ) }
					className="address-step__city"
					error={ fieldErrors.city || generalErrorOnly }
				/>
				{ stateNames ? (
					<Dropdown
						id={ getId( 'state' ) }
						title={ translate( 'State' ) }
						value={ getValue( 'state' ) }
						valuesMap={ { '': props.translate( 'Select one…' ), ...stateNames } }
						updateValue={ updateValue( 'state' ) }
						className="address-step__state"
						error={ fieldErrors.state || generalErrorOnly }
					/>
				) : (
					<TextField
						id={ getId( 'state' ) }
						title={ translate( 'State' ) }
						value={ getValue( 'state' ) }
						updateValue={ updateValue( 'state' ) }
						className="address-step__state"
						error={ fieldErrors.state || generalErrorOnly }
					/>
				) }
				<TextField
					id={ getId( 'postcode' ) }
					title={ translate( 'Postal code' ) }
					value={ getValue( 'postcode' ) }
					updateValue={ updateValue( 'postcode' ) }
					className="address-step__postal-code"
					error={ fieldErrors.postcode || generalErrorOnly }
				/>
			</div>
			<Dropdown
				id={ getId( 'country' ) }
				title={ translate( 'Country' ) }
				value={ getValue( 'country' ) }
				disabled={ ! allowChangeCountry }
				valuesMap={ countryNames }
				updateValue={ updateValue( 'country' ) }
				error={ fieldErrors.country || generalErrorOnly }
			/>

			<div className="address-step__actions">
				<FormButton
					type="button"
					disabled={ hasNonEmptyLeaves( errors ) || normalizationInProgress }
					onClick={ submitAddressForNormalizationHandler }
				>
					{ translate( 'Verify address' ) }
				</FormButton>

				<FormButton
					type="button"
					disabled={ ! isUsable }
					onClick={ confirmAddressSuggestionHandler }
					borderless
				>
					{ translate( 'Use address as entered' ) }
				</FormButton>
			</div>
		</div>
	);
};

AddressFields.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	values: PropTypes.object.isRequired,
	isNormalized: PropTypes.bool.isRequired,
	normalized: PropTypes.object,
	selectNormalized: PropTypes.bool.isRequired,
	allowChangeCountry: PropTypes.bool.isRequired,
	errors: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	group: PropTypes.string.isRequired,
	countryNames: PropTypes.object.isRequired,
	stateNames: PropTypes.object,
};

const mapStateToProps = ( state, { group, orderId, siteId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	const formData = shippingLabel.form[ group ];

	let countryNames =
		'origin' === group
			? getOriginCountryNames( state, siteId )
			: getDestinationCountryNames( state, siteId );
	if ( ! countryNames[ formData.values.country ] ) {
		// If the selected country is not supported but the user managed to select it, add it to the list
		countryNames = {
			[ formData.values.country ]: getCountryName( state, formData.values.country, siteId ),
			...countryNames,
		};
	}

	return {
		...formData,
		errors: loaded && getFormErrors( state, orderId, siteId )[ group ],
		isUsable: loaded && isAddressUsable( state, orderId, group, siteId ),
		countryNames,
		stateNames: getStateNames( state, formData.values.country, siteId ),
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators(
		{
			selectNormalizedAddress,
			confirmAddressSuggestion,
			editAddress,
			editUnverifiableAddress,
			updateAddressValue,
			submitAddressForNormalization,
		},
		dispatch
	);
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( AddressFields ) );
