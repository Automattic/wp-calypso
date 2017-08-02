import React from 'react';

import { translate } from 'i18n-calypso';
import Card from 'components/card';
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';

import PersonalGraphic from './personal-graphic';
import BusinessGraphic from './business-graphic';

module.exports = React.createClass( {

	displayName: 'SelectBusinessAddress',

	propTypes: {
		required: React.PropTypes.bool,
	},

	render: function() {
		if ( ! this.props.current ) {
			return ( <div /> );
		}

		return ( 
			<div className="jpo__site-type-wrapper business-address">
				<Card>
					<FormLabel>{ translate( 'Business Name' ) }</FormLabel>
					<FormTextInput onChange={ this.props.onInputBusinessName } />
					<FormLabel>{ translate( 'Street Address' ) }</FormLabel>
					<FormTextInput onChange={ this.props.onInputStreetAddress } />
					<FormLabel>{ translate( 'City' ) }</FormLabel>
					<FormTextInput onChange={ this.props.onInputCity } />
					<FormLabel>{ translate( 'State' ) }</FormLabel>
					<FormTextInput onChange={ this.props.onInputState } />
					<FormLabel>{ translate( 'ZIP Code' ) }</FormLabel>
					<FormTextInput onChange={ this.props.onInputZip } />
					<Button primary onClick={ this.props.submitStep }>{ translate( 'Next Step' ) }</Button>
				</Card>
			</div>
		);
	}

} );