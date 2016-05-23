/**
 * External dependencies
 */
var React = require( 'react' ),
	find = require( 'lodash/find' );

module.exports = React.createClass( {
	displayName: 'PrivacyProtectionExample',

	render: function() {
		var countriesList = this.props.countriesList.get(),
			country,
			lines = [],
			line = '';

		if ( this.props.fields.firstName.value || this.props.fields.lastName.value ) {
			lines.push( this.props.fields.firstName.value + ' ' + this.props.fields.lastName.value );
		} else if ( ! this.props.fields.organization.value ) {
			lines.push( this.translate( 'Your Name' ) );
		}

		if ( this.props.fields.organization.value ) {
			lines.push( this.props.fields.organization.value );
		}

		if ( this.props.fields.email.value ) {
			lines.push( this.props.fields.email.value );
		} else {
			lines.push( this.translate( 'Your Email' ) );
		}

		if ( this.props.fields.address1.value || this.props.fields.address2.value ) {
			if ( this.props.fields.address1.value ) {
				lines.push( this.props.fields.address1.value );
			}

			if ( this.props.fields.address2.value ) {
				lines.push( this.props.fields.address2.value );
			}
		} else {
			lines.push( this.translate( 'Your Address' ) );
		}

		if ( this.props.fields.city.value ) {
			line += this.props.fields.city.value;
		} else {
			line += this.translate( 'Your City', { textOnly: true } );
		}

		if ( this.props.fields.state.value || this.props.fields.postalCode.value ) {
			line += ', ';

			if ( this.props.fields.state.value ) {
				line += this.props.fields.state.value;
			}

			line += ' ';

			if ( this.props.fields.postalCode.value ) {
				line += this.props.fields.postalCode.value;
			}
		}

		lines.push( line );

		if ( this.props.fields.countryCode.value ) {
			country = find( countriesList, { code: this.props.fields.countryCode.value } );
		}

		if ( country ) {
			lines.push( country.name );
		} else {
			lines.push( this.translate( 'Your Country' ) );
		}

		if ( this.props.fields.phone.value ) {
			lines.push( this.props.fields.phone.value );
		} else {
			lines.push( this.translate( 'Your Phone Number' ) );
		}

		return (
			<p>{ lines.map( l => <span>{ l }</span> ) } </p>
		);
	}
} );
