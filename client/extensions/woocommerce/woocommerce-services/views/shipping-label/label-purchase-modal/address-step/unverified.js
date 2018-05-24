/** @format */

/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import url from 'url';
import { invokeMap } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormButton from 'components/forms/form-button';
import Notice from 'components/notice';
import AddressSummary from './summary';

const UnverifiedAddress = ( {
	values,
	countriesData,
	editAddress,
	confirmAddressSuggestion,
	translate,
} ) => {
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
			<Notice status="is-info" showDismiss={ false }>
				{ translate( 'We were unable to verify the address.' ) }
			</Notice>
			<div>
				<div>
					<span>{ translate( 'Address entered' ) }</span>
					<AddressSummary values={ values } countriesData={ countriesData } />
				</div>
				<div>
					<p>
						{ translate(
							'Automatic verification failed for this address. ' +
								'You can use the tools below to manually verify.'
						) }
					</p>
					<Button href={ uspsUrl } compact={ true } target="_blank">
						<span>{ translate( 'Verify with USPS' ) }</span>
						<Gridicon icon="external" />
					</Button>
					<Button href={ googleMapsUrl } compact={ true } target="_blank">
						<span>{ translate( 'View on Google Maps' ) }</span>
						<Gridicon icon="external" />
					</Button>
				</div>
			</div>
			<div>
				<FormButton type="button" isPrimary={ false } onClick={ confirmAddressSuggestion }>
					{ translate( 'Use address as entered' ) }
				</FormButton>
				<FormButton type="button" onClick={ editAddress }>
					{ translate( 'Edit address' ) }
				</FormButton>
			</div>
		</div>
	);
};

UnverifiedAddress.propTypes = {
	values: PropTypes.object.isRequired,
	confirmAddressSuggestion: PropTypes.func.isRequired,
	editAddress: PropTypes.func.isRequired,
	countriesData: PropTypes.object.isRequired,
};

export default localize( UnverifiedAddress );
