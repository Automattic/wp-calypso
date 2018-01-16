/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { difference, identity, set } from 'lodash';

/**
 * Internal dependencies
 */
import { ValidatedRegistrantExtraInfoUkForm } from '../uk-form';

jest.mock( 'lib/wp', () => ( {
	undocumented: () => ( {
		getDomainContactInformationValidationSchema: ( _, callback ) => {
			callback( null, { uk: require( './uk-schema.json' ) } );
		},
	} ),
} ) );

const mockProps = {
	translate: identity,
	updateContactDetailsCache: identity,
};

describe( 'uk-form validation', () => {
	const validTradingName = 'A valid trading name';
	const validRegistrationNumber = 'AB123456';

	const allRegistrantTypes = [
		'CRC',
		'FCORP',
		'FIND',
		'FOTHER',
		'GOV',
		'IND',
		'IP',
		'LLP',
		'LTD',
		'OTHER',
		'PLC',
		'PTNR',
		'RCHAR',
		'SCH',
		'STAT',
		'STRA',
	];

	// see http://domains.opensrs.guide/docs/tld#section-uk
	const needsRegistrationNumber = [ 'LTD', 'PLC', 'LLP', 'IP', 'SCH', 'RCHAR' ];

	const needsTradingName = [
		'LTD',
		'PLC',
		'LLP',
		'IP',
		'RCHAR',
		'FCORP',
		'OTHER',
		'FOTHER',
		'STRA',
	];

	describe( 'registrationNumber field', () => {
		test( 'should be required for some values of registrantType', () => {
			const testContactDetails = {
				extra: {
					registrantType: 'LLP',
					tradingName: validTradingName,
				},
			};

			needsRegistrationNumber.forEach( registrantType => {
				const wrapper = shallow(
					<ValidatedRegistrantExtraInfoUkForm
						{ ...mockProps }
						contactDetails={ set( testContactDetails, 'extra.registrantType', registrantType ) }
					/>
				);

				expect( wrapper.props() ).toHaveProperty( 'validationErrors', {
					extra: { registrationNumber: [ 'dotukRegistrantTypeRequiresRegistrationNumber' ] },
				} );
			} );
		} );

		test( 'should not be required for other values of registrantType', () => {
			const testContactDetails = {
				extra: {
					registrantType: 'LLP',
					tradingName: validTradingName,
				},
			};

			difference( allRegistrantTypes, needsRegistrationNumber ).forEach( registrantType => {
				const wrapper = shallow(
					<ValidatedRegistrantExtraInfoUkForm
						{ ...mockProps }
						contactDetails={ set( testContactDetails, 'extra.registrantType', registrantType ) }
					/>
				);

				expect( wrapper.props() ).toHaveProperty( 'validationErrors', {} );
			} );
		} );

		test( 'should reject bad formats', () => {
			const testContactDetails = {
				extra: {
					registrantType: 'LLP',
					tradingName: validTradingName,
				},
			};

			const badFormats = [ '124', 'OC38599', '066566879', 'OCABCDEF', '054025OC' ];

			badFormats.forEach( registrationNumber => {
				const wrapper = shallow(
					<ValidatedRegistrantExtraInfoUkForm
						{ ...mockProps }
						contactDetails={ set(
							testContactDetails,
							'extra.registrationNumber',
							registrationNumber
						) }
					/>
				);

				expect( wrapper.props() ).toHaveProperty( 'validationErrors.extra.registrationNumber' );
			} );
		} );
	} );

	describe( 'tradingName', () => {
		test( 'should be required for some values of registrantType', () => {
			const testContactDetails = {
				extra: {
					registrantType: 'LLP',
					registrationNumber: validRegistrationNumber,
					tradingName: '',
				},
			};

			needsTradingName.forEach( registrantType => {
				const wrapper = shallow(
					<ValidatedRegistrantExtraInfoUkForm
						{ ...mockProps }
						contactDetails={ set( testContactDetails, 'extra.registrantType', registrantType ) }
					/>
				);

				expect( wrapper.props() ).toHaveProperty( 'validationErrors', {
					extra: { tradingName: [ 'dotukRegistrantTypeRequiresTradingName' ] },
				} );
			} );
		} );

		test( 'should not be required for other values of registrantType', () => {
			difference( allRegistrantTypes, needsTradingName ).forEach( registrantType => {
				const testContactDetails = {
					extra: {
						registrantType,
						registrationNumber: validRegistrationNumber,
						tradingName: '',
					},
				};

				const wrapper = shallow(
					<ValidatedRegistrantExtraInfoUkForm
						{ ...mockProps }
						contactDetails={ testContactDetails }
					/>
				);

				expect( wrapper.props() ).toHaveProperty( 'validationErrors', {} );
			} );
		} );
	} );
} );
