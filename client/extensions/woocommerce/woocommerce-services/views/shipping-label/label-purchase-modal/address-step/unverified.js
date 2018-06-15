/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import url from 'url';
import { invokeMap } from 'lodash';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import FormButton from 'components/forms/form-button';
import Notice from 'components/notice';
import AddressSummary from './summary';

const UnverifiedAddress = ( {
	values,
	countriesData,
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
				<Notice status="is-info" showDismiss={ false }>
					{ translate( 'We were unable to automatically verify the address — %(error)s.', {
						args: {
							error: verificationError,
						},
					} ) }
				</Notice>
			);
		}

		return (
			<Notice status="is-info" showDismiss={ false }>
				{ translate( 'We were unable to automatically verify the address.' ) }
			</Notice>
		);
	};

	const uspsUrlProperties = {
		scheme: 'https',
		hostname: 'tools.usps.com',
		pathname: '/zip-code-lookup.htm',
		query: {
			mode: 'byAddress',
			companyName: values.company,
			address1: values.address,
			address2: values.address_2,
			city: values.city,
			state: values.state,
			zip: values.postcode,
		},
	};

	const uspsUrl = url.format( uspsUrlProperties );

	const googleMapsAddressString = invokeMap(
		[ values.address + ' ' + values.address_2, values.city, values.state + ' ' + values.postcode ],
		'trim'
	).join( ', ' );

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
					<AddressSummary values={ values } countriesData={ countriesData } />
				</div>
				<div className="address-step__unverifiable-info">
					<p>
						{ translate(
							'Automatic verification failed for this address. ' +
								'It may still be a valid address — use the tools below to manually verify.'
						) }
					</p>
					<ExternalLink icon={ true } href={ uspsUrl } target="_blank">
						{ translate( 'Verify with USPS' ) }
					</ExternalLink>
					<ExternalLink icon={ true } href={ googleMapsUrl } target="_blank">
						{ translate( 'View on Google Maps' ) }
					</ExternalLink>
				</div>
			</div>
			<div className="address-step__unverifiable-actions step-confirmation-button">
				<FormButton type="button" isPrimary={ false } onClick={ confirmAddressSuggestion }>
					{ translate( 'Use address as entered' ) }
				</FormButton>
				<FormButton type="button" onClick={ editUnverifiableAddress }>
					{ translate( 'Edit address' ) }
				</FormButton>
			</div>
		</div>
	);
};

UnverifiedAddress.propTypes = {
	values: PropTypes.object.isRequired,
	confirmAddressSuggestion: PropTypes.func.isRequired,
	editUnverifiableAddress: PropTypes.func.isRequired,
	countriesData: PropTypes.object.isRequired,
};

export default localize( UnverifiedAddress );
