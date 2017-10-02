/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';

class SelectBusinessAddress extends React.Component {

	static propTypes = {
		signupDependencies: PropTypes.object,
		handleBusinessInfo: PropTypes.func,
		businessInfo: PropTypes.object,
		required: PropTypes.bool,
	};

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
						name="businessName"
						value={ businessName }
						onChange={ handleBusinessInfo }
						/>
					<FormLabel>{ translate( 'Street Address' ) }</FormLabel>
					<FormTextInput
						name="streetAddress"
						value={ streetAddress }
						onChange={ handleBusinessInfo }
						/>
					<FormLabel>{ translate( 'City' ) }</FormLabel>
					<FormTextInput
						name="city"
						value={ city }
						onChange={ handleBusinessInfo }
						/>
					<FormLabel>{ translate( 'State' ) }</FormLabel>
					<FormTextInput
						name="state"
						value={ state }
						onChange={ handleBusinessInfo }
						/>
					<FormLabel>{ translate( 'ZIP Code' ) }</FormLabel>
					<FormTextInput
						name="zipCode"
						value={ zipCode }
						onChange={ handleBusinessInfo }
						/>
					<Button primary onClick={ this.props.submitStep }>{ translate( 'Next Step' ) }</Button>
				</Card>
			</div>
		);
	}

}

export default SelectBusinessAddress;
