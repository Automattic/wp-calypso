/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getRatesErrors, getCountriesData } from '../selectors';

describe( '#getRatesErrors', () => {
	// when there are selected rates
	// the values match `service_id` in the rate object
	const firstBoxSelectedValues = {
		box_1: 'Priority',
	};
	const secondBoxSelectedValues = {
		box_2: 'Express',
	};

	// rates when there are no server errors, for each box
	const firstBoxRatesWithNoServerErrors = {
		box_1: {
			shipment_id: 'shp_1',
			rates: [
				{
					rate_id: 'rate_box_1_a',
					service_id: 'Priority',
					carrier_id: 'usps',
					title: 'USPS - Priority Mail',
					rate: 10,
					is_selected: true,
				},
				{
					rate_id: 'rate_box_1_b',
					service_id: 'Express',
					carrier_id: 'usps',
					title: 'USPS - Express Mail',
					rate: 11,
					is_selected: false,
				},
			],
			errors: [],
		},
	};
	const secondBoxRatesWithNoServerErrors = {
		box_2: {
			shipment_id: 'shp_2',
			rates: [
				{
					rate_id: 'rate_box_2_a',
					service_id: 'Priority',
					carrier_id: 'usps',
					title: 'USPS - Priority Mail',
					rate: 20,
					is_selected: false,
				},
				{
					rate_id: 'rate_box_2_b',
					service_id: 'Express',
					carrier_id: 'usps',
					title: 'USPS - Express Mail',
					rate: 21,
					is_selected: true,
				},
			],
			errors: [],
		},
	};

	// rates when there are server errors
	const firstBoxRatesWithError = {
		box_1: {
			rates: [],
			errors: [ {
				code: 'ERROR 1',
				message: 'There was an error!',
			} ],
		},
	};
	const firstBoxRatesWithUserMessageError = {
		box_1: {
			rates: [],
			errors: [ {
				code: 'ERROR 1',
				userMessage: 'This is a friendly error message!',
			} ],
		},
	};
	const firstBoxRatesWithErrorButNoErrorMessage = {
		box_1: {
			rates: [],
			errors: [ {
				code: 'ERROR 1',
			} ],
		},
	};
	const firstBoxRatesWithMultipleErrors = {
		box_1: {
			rates: [],
			errors: [
				{
					code: 'ERROR A',
					message: 'Error 1',
				},
				{
					code: 'ERROR B',
					message: 'Error 2',
				},
			],
		},
	};

	describe( 'a box with server errors', () => {
		// i.e. it has an errors array, and an empty rates array

		// `rates` is form.rates in the state
		// `values` is the currently-selected rate in the form
		// an empty string means none is selected
		// `available` is all the available rates for the package/box

		// rates with a message prop in the error object
		const rates = {
			values: {
				box_1: '',
			},
			available: firstBoxRatesWithError,
		};
		const result = getRatesErrors( rates );

		it( 'should return the server error and a form error', () => {
			expect( result ).to.eql( {
				server: {
					box_1: [ 'There was an error!' ],
				},
				form: {
					box_1: 'Please choose a rate',
				},
			} );
		} );

		// rates with a userMessage prop in the error object
		const ratesWithUserMessage = {
			...rates,
			available: firstBoxRatesWithUserMessageError,
		};
		const resultWithUserMessage = getRatesErrors( ratesWithUserMessage );

		it( 'should return the `userMessage` if it exists', () => {
			expect( resultWithUserMessage.server ).to.eql( {
				box_1: [ 'This is a friendly error message!' ],
			} );
		} );

		// rates with no message or userMessage prop in the error object
		const ratesWithNoMessage = {
			...rates,
			available: firstBoxRatesWithErrorButNoErrorMessage,
		};
		const resultWithErrorAndNoMessage = getRatesErrors( ratesWithNoMessage );

		it( 'should return the the default error message if no error message sent', () => {
			expect( resultWithErrorAndNoMessage.server ).to.eql( {
				box_1: [ "We couldn't get a rate for this package, please try again." ],
			} );
		} );

		describe( 'multiple errors', () => {
			const ratesWithMultipleErrors = {
				values: {
					box_1: '',
				},
				available: firstBoxRatesWithMultipleErrors,
			};
			const resultWithMultipleErrors = getRatesErrors( ratesWithMultipleErrors );

			it( 'should return array with each server error', () => {
				expect( resultWithMultipleErrors.server ).to.eql( {
					box_1: [
						'Error 1',
						'Error 2',
					],
				} );
			} );
		} );
	} );

	describe( 'a box with no server errors', () => {
		// i.e. it has a rates array, and an empty errors array

		describe( 'rate is selected', () => {
			const rates = {
				values: Object.assign( {}, firstBoxSelectedValues ),
				available: firstBoxRatesWithNoServerErrors,
			};
			const result = getRatesErrors( rates );

			it( 'should return a null form error and no server errors', () => {
				expect( result ).to.eql( {
					server: {
						box_1: [],
					},
					form: {
						box_1: null,
					},
				} );
			} );
		} );

		describe( 'rate is not selected', () => {
			const rates = {
				values: {
					box_1: '',
				},
				available: firstBoxRatesWithNoServerErrors,
			};
			const result = getRatesErrors( rates );

			it( 'should return a form error and no server errors', () => {
				expect( result ).to.eql( {
					server: {
						box_1: [],
					},
					form: {
						box_1: 'Please choose a rate',
					},
				} );
			} );
		} );
	} );

	describe( 'two boxes: box 1 with server errors, box 2 without', () => {
		describe( 'rate is selected for box 2', () => {
			const rates = {
				values: {
					box_1: '',
					box_2: Object.assign( {}, secondBoxSelectedValues ),
				},
				available: Object.assign( {},
					firstBoxRatesWithError,
					secondBoxRatesWithNoServerErrors
				),
			};
			const result = getRatesErrors( rates );

			it( 'should return the server error for the first box', () => {
				expect( result.server ).to.eql( {
					box_1: [ 'There was an error!' ],
					box_2: [],
				} );
			} );

			it( 'should return the form error for the second box', () => {
				expect( result.form ).to.eql( {
					box_1: 'Please choose a rate',
					box_2: null,
				} );
			} );
		} );

		describe( 'rate not selected for box 2', () => {
			const rates = {
				values: {
					box_1: '',
					box_2: '',
				},
				available: Object.assign( {},
					firstBoxRatesWithError,
					secondBoxRatesWithNoServerErrors
				),
			};
			const result = getRatesErrors( rates );

			it( 'should return the server error for the first box', () => {
				expect( result.server ).to.eql( {
					box_1: [ 'There was an error!' ],
					box_2: [],
				} );
			} );

			it( 'should return no error for the second box', () => {
				expect( result.form ).to.eql( {
					box_1: 'Please choose a rate',
					box_2: 'Please choose a rate',
				} );
			} );
		} );
	} );
} );

describe( 'Shipping label selectors', () => {
	const siteId = 1;
	const orderId = 1;
	const getFullState = ( labelsState ) => (
		{
			extensions: {
				woocommerce: {
					woocommerceServices: {
						[ siteId ]: {
							shippingLabel: {
								[ orderId ]: labelsState,
							},
						},
					},
				},
			},
		}
	);

	it( 'getCountriesData - returns null if labels not loaded', () => {
		const state = getFullState( { loaded: false } );
		const result = getCountriesData( state, orderId, siteId );
		expect( result ).to.eql( null );
	} );

	it( 'getCountriesData - returns the countries data if they exist', () => {
		const state = getFullState( {
			loaded: true,
			storeOptions: {
				countriesData: {
					US: {
						CA: 'California',
					},
				},
			},
		} );
		const result = getCountriesData( state, orderId, siteId );
		expect( result ).to.eql( {
			US: {
				CA: 'California',
			},
		} );
	} );
} );
