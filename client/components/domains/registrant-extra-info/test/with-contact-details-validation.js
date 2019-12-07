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

jest.mock( 'state/selectors/get-validation-schemas', () => () => ( {
	uk: require( './uk-schema.json' ),
} ) );

const mockProps = {
	translate: identity,
	updateContactDetailsCache: identity,
	tld: 'uk',
	store: {
		getState: () => {},
		subscribe: () => {},
		dispatch: () => {},
	},
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
					uk: {
						registrantType: 'LLP',
						tradingName: validTradingName,
					},
				},
			};

			needsRegistrationNumber.forEach( registrantType => {
				const wrapper = shallow(
					<ValidatedRegistrantExtraInfoUkForm
						{ ...mockProps }
						contactDetails={ set( testContactDetails, 'extra.uk.registrantType', registrantType ) }
						ccTldDetails={ { registrantType } }
					/>
				).dive();

				expect( wrapper.props() ).toMatchObject( {
					validationErrors: {
						extra: {
							uk: {
								registrationNumber: [
									{ errorMessage: 'A registration number is required for this registrant type.' },
								],
							},
						},
					},
				} );
			} );
		} );

		test( 'should not be required for other values of registrantType', () => {
			const testContactDetails = {
				extra: {
					uk: {
						registrantType: 'LLP',
						tradingName: validTradingName,
					},
				},
			};

			difference( allRegistrantTypes, needsRegistrationNumber ).forEach( registrantType => {
				const wrapper = shallow(
					<ValidatedRegistrantExtraInfoUkForm
						{ ...mockProps }
						contactDetails={ set( testContactDetails, 'extra.uk.registrantType', registrantType ) }
						ccTldDetails={ { registrantType } }
					/>
				).dive();

				expect( wrapper.props() ).toHaveProperty( 'validationErrors', {} );
			} );
		} );

		test( 'should reject bad formats', () => {
			const testContactDetails = {
				extra: {
					uk: {
						registrantType: 'LLP',
						tradingName: validTradingName,
					},
				},
			};

			const badFormats = [ '124', 'OC38599', '066566879', 'OCABCDEF', '054025OC' ];

			badFormats.forEach( registrationNumber => {
				const wrapper = shallow(
					<ValidatedRegistrantExtraInfoUkForm
						{ ...mockProps }
						contactDetails={ set(
							testContactDetails,
							'extra.uk.registrationNumber',
							registrationNumber
						) }
						ccTldDetails={ { registrationNumber } }
					/>
				).dive();

				expect( wrapper.props() ).toHaveProperty( 'validationErrors.extra.uk.registrationNumber' );
			} );
		} );
	} );

	describe( 'tradingName', () => {
		test( 'should be required for some values of registrantType', () => {
			const testContactDetails = {
				extra: {
					uk: {
						registrantType: 'LLP',
						registrationNumber: validRegistrationNumber,
						tradingName: '',
					},
				},
			};

			needsTradingName.forEach( registrantType => {
				const wrapper = shallow(
					<ValidatedRegistrantExtraInfoUkForm
						{ ...mockProps }
						contactDetails={ set( testContactDetails, 'extra.uk.registrantType', registrantType ) }
						ccTldDetails={ { registrantType } }
					/>
				).dive();

				expect( wrapper.props() ).toMatchObject( {
					validationErrors: {
						extra: {
							uk: {
								tradingName: [
									{ errorMessage: 'A trading name is required for this registrant type.' },
								],
							},
						},
					},
				} );
			} );
		} );

		test( 'should not be required for other values of registrantType', () => {
			difference( allRegistrantTypes, needsTradingName ).forEach( registrantType => {
				const testContactDetails = {
					extra: {
						uk: {
							registrantType,
							registrationNumber: validRegistrationNumber,
							tradingName: '',
						},
					},
				};

				const wrapper = shallow(
					<ValidatedRegistrantExtraInfoUkForm
						{ ...mockProps }
						contactDetails={ testContactDetails }
						ccTldDetails={ testContactDetails.extra.uk }
					/>
				).dive();

				expect( wrapper.props() ).toHaveProperty( 'validationErrors', {} );
			} );
		} );
	} );
} );
