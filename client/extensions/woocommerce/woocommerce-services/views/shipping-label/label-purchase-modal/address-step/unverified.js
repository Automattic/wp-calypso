/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import url from 'url';

/**
 * Internal dependencies
 */
import ExternalLink from 'calypso/components/external-link';
import FormButton from 'calypso/components/forms/form-button';
import Notice from 'calypso/components/notice';
import AddressSummary from './summary';
import { ACCEPTED_USPS_ORIGIN_COUNTRIES } from 'woocommerce/woocommerce-services/state/shipping-label/constants';

const UnverifiedAddress = ( {
	values,
	countryNames,
	editUnverifiableAddress,
	confirmAddressSuggestion,
	translate,
	fieldErrors,
} ) => {
	// Reduce the address verification errors object to a single error string.
	const getVerificationError = () => {
		if ( fieldErrors.general ) {
			return fieldErrors.general;
		}

		// Return the first field error if there is no general error.
		for ( const field in fieldErrors ) {
			return fieldErrors[ field ];
		}

		return false;
	};

	const renderNotice = () => {
		const verificationError = getVerificationError( fieldErrors );

		if ( verificationError ) {
			return (
				<Notice status="is-error" showDismiss={ false }>
					{ translate( 'We were unable to automatically verify the address — %(error)s.', {
						args: {
							error: verificationError,
						},
					} ) }
				</Notice>
			);
		}

		return (
			<Notice status="is-error" showDismiss={ false }>
				{ translate( 'We were unable to automatically verify the address.' ) }
			</Notice>
		);
	};

	// USPS can only validate addresses that have a ZIP code. That limits it to the US and territories that have USPS presence
	const uspsUrl = ACCEPTED_USPS_ORIGIN_COUNTRIES.includes( values.country )
		? url.format( {
				scheme: 'https',
				hostname: 'tools.usps.com',
				pathname: '/zip-code-lookup.htm',
				query: {
					mode: 'byAddress',
					companyName: values.company,
					address1: values.address,
					address2: values.address_2,
					city: values.city,
					// The territory code (PR for Puerto Rico, VI for Virgin Islands, etc) must be submitted as the "state" field
					state: 'US' === values.country ? values.state : values.country,
					zip: values.postcode,
				},
		  } )
		: null;

	const googleMapsAddressString = [
		values.address + ' ' + values.address_2,
		values.city,
		values.state + ' ' + values.postcode,
	]
		.map( ( addressLine ) => addressLine.trim() )
		.join( ', ' );

	const googleMapsUrlProperties = {
		scheme: 'https',
		hostname: 'www.google.com',
		pathname: '/maps/place/' + encodeURIComponent( googleMapsAddressString ),
	};

	const googleMapsUrl = url.format( googleMapsUrlProperties );

	return (
		<div>
			{ renderNotice() }
			<div className="address-step__unverifiable-container">
				<div className="address-step__unverifiable-info">
					<span className="address-step__unverifiable-title">
						{ translate( 'Address entered' ) }
					</span>
					<AddressSummary values={ values } countryNames={ countryNames } />
				</div>
				<div className="address-step__unverifiable-info">
					<p>
						{ translate(
							'Automatic verification failed for this address. ' +
								'It may still be a valid address — use the tools below to manually verify.'
						) }
					</p>
					{ uspsUrl && (
						<ExternalLink icon href={ uspsUrl } target="_blank">
							{ translate( 'Verify with USPS' ) }
						</ExternalLink>
					) }
					<ExternalLink icon href={ googleMapsUrl } target="_blank">
						{ translate( 'View on Google Maps' ) }
					</ExternalLink>
				</div>
			</div>
			<div className="address-step__actions">
				<FormButton type="button" onClick={ editUnverifiableAddress }>
					{ translate( 'Edit address' ) }
				</FormButton>
				<FormButton type="button" onClick={ confirmAddressSuggestion } borderless>
					{ translate( 'Use address as entered' ) }
				</FormButton>
			</div>
		</div>
	);
};

UnverifiedAddress.propTypes = {
	values: PropTypes.object.isRequired,
	confirmAddressSuggestion: PropTypes.func.isRequired,
	editUnverifiableAddress: PropTypes.func.isRequired,
	countryNames: PropTypes.object.isRequired,
};

export default localize( UnverifiedAddress );
