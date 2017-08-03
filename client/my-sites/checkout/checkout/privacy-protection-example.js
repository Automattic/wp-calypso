/**
 * External dependencies
 */
import React from 'react';
import find from 'lodash/find';
import { localize } from 'i18n-calypso';

const PrivacyProtectionExample = ( { translate, fields, countriesList } ) => {
	const {
			firstName: { value: firstName },
			lastName: { value: lastName },
			organization: { value: organization },
			email: { value: email },
			address1: { value: address1 },
			address2: { value: address2 },
			city: { value: city },
			state: { value: state },
			postalCode: { value: postalCode },
			countryCode: { value: countryCode },
			phone: { value: phone }
		} = fields,
		country = countryCode && find( countriesList.get(), { code: countryCode } ),
		lines = [];
	let addressLine = '';

	if ( firstName || lastName ) {
		lines.push( firstName + ' ' + lastName );
	} else if ( ! organization ) {
		lines.push( translate( 'Your Name' ) );
	}

	if ( organization ) {
		lines.push( organization );
	}

	if ( email ) {
		lines.push( email );
	} else {
		lines.push( translate( 'Your Email' ) );
	}

	if ( address1 || address2 ) {
		if ( address1 ) {
			lines.push( address1 );
		}

		if ( address2 ) {
			lines.push( address2 );
		}
	} else {
		lines.push( translate( 'Your Address' ) );
	}

	if ( city ) {
		addressLine += city;
	} else {
		addressLine += translate( 'Your City' );
	}

	if ( state || postalCode ) {
		addressLine += ', ';

		if ( state ) {
			addressLine += state;
		}

		addressLine += ' ';

		if ( postalCode ) {
			addressLine += postalCode;
		}
	}

	lines.push( addressLine );

	if ( country ) {
		lines.push( country.name );
	} else {
		lines.push( translate( 'Your Country' ) );
	}

	if ( phone ) {
		lines.push( phone );
	} else {
		lines.push( translate( 'Your Phone Number' ) );
	}

	return (
		<p>{ lines.map(
			( line, index ) => {
				return <span key={ `privacy-protection-example-line-${ index }` }>{ line }</span>;
			}
		) } </p>
	);
};

export default localize( PrivacyProtectionExample );
