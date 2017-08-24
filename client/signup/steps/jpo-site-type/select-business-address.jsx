/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';

const SelectBusinessAddress = React.createClass( {

	propTypes: {
		signupDependencies: PropTypes.object,
		handleBusinessInfo: PropTypes.func,
		businessInfo: PropTypes.object,
		required: PropTypes.bool,
	},

	validateZipCode( zipCode ) {
		return ! isNaN( parseFloat( zipCode ) ) && isFinite( zipCode );
	},

	validateAndSubmit() {
		const businessInfo = this.props.businessInfo;

		if ( ! businessInfo.businessName ) {
			this.setState( { businessNameInvalid: true } );
		}

		if ( ! businessInfo.streetAddress ) {
			this.setState( { businessAddressInvalid: true } );
		}

		if ( ! businessInfo.city ) {
			this.setState( { businessCityInvalid: true } );
		}

		if ( ! businessInfo.state ) {
			this.setState( { businessStateInvalid: true } );
		}

		if ( ! this.validateZipCode( businessInfo.zipCode ) ) {
			this.setState( { businessZipInvalid: true } );
		}

		if ( businessInfo.businessName
			&& businessInfo.streetAddress
			&& businessInfo.city
			&& businessInfo.state
			&& this.validateZipCode( businessInfo.zipCode )
		) {
			this.props.submitStep();
		} else {
			this.errorMessage = 'Please enter a valid business address.';

			return false;
		}
	},

	handleFieldChange( event ) {
		switch ( event.target.name ) {
			case 'businessName':
				this.setState( { businessNameInvalid: false } );
				break;
			case 'streetAddress':
				this.setState( { businessAddressInvalid: false } );
				break;
			case 'city':
				this.setState( { businessCityInvalid: false } );
				break;
			case 'state':
				this.setState( { businessStateInvalid: false } );
				break;
			case 'zipCode':
				this.setState( { businessZipInvalid: false } );
				break;
		}

		this.errorMessage = '';

		this.props.handleBusinessInfo( event );
	},

	render() {
		if ( ! this.props.current ) {
			return ( <div /> );
		}

		const {
			handleBusinessInfo,
			businessInfo: {
				businessName,
				streetAddress,
				city,
				state,
				zipCode
			}
		} = this.props;

		return ( 
			<div className="jpo__site-type-wrapper business-address">
				<Card>
					<FormLabel>{ translate( 'Business Name' ) }</FormLabel>
					<FormTextInput
						isError={ get( this.state, 'businessNameInvalid', false ) }
						name="businessName"
						value={ businessName }
						onChange={ this.handleFieldChange }
						/>
					<FormLabel>{ translate( 'Street Address' ) }</FormLabel>
					<FormTextInput
						isError={ get( this.state, 'businessAddressInvalid', false ) }
						name="streetAddress"
						value={ streetAddress }
						onChange={ this.handleFieldChange }
						/>
					<FormLabel>{ translate( 'City' ) }</FormLabel>
					<FormTextInput
						isError={ get( this.state, 'businessCityInvalid', false ) }
						name="city"
						value={ city }
						onChange={ this.handleFieldChange }
						/>
					<FormLabel>{ translate( 'State' ) }</FormLabel>
					<FormTextInput
						isError={ get( this.state, 'businessStateInvalid', false ) }
						name="state"
						value={ state }
						onChange={ this.handleFieldChange }
						/>
					<FormLabel>{ translate( 'ZIP Code' ) }</FormLabel>
					<FormTextInput
						isError={ get( this.state, 'businessZipInvalid', false ) }
						name="zipCode"
						value={ zipCode }
						onChange={ this.handleFieldChange }
						/>
					<FormLabel className="jpo__validation-error">{ this.errorMessage }</FormLabel>
					<Button primary onClick={ this.validateAndSubmit }>{ translate( 'Next Step' ) }</Button>
				</Card>
			</div>
		);
	}

} );

export default SelectBusinessAddress;
