/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { openPrintingFlow } from '../actions';

const context = {
	storeOptions: {
		countriesData: {
			US: '',
		},
	},
};

function createGetStateFn( newProps = { origin: {}, destination: {} } ) {
	const defaultProps = {
		ignoreValidation: false,
		selectNormalized: false,
		isNormalized: false, // hack to prevent getLabelRates() in openPrintingFlow
		normalized: '',
		expanded: true, // hack to prevent getLabelRates() in openPrintingFlow
		values: {
			address: 'Some street',
			postcode: '',
			state: 'CA',
			country: 'US',
			phone: '123',
		},
	};

	const origin = Object.assign( {}, defaultProps, newProps.origin );
	const destination = Object.assign( {}, defaultProps, newProps.destination );

	return function() {
		return {
			shippingLabel: {
				form: {
					origin,
					destination,
					packages: {
						selected: {},
					},
					rates: {
						values: {},
					},
				},
			},
		};
	};
}

function createGetFormErrorsFn( opts = {} ) {
	const errors = {};
	const defaultError = {
		address: 'This address is not recognized. Please try another.',
	};

	if ( opts.setOriginError ) {
		errors.origin = defaultError;
	}

	if ( opts.setDestinationError ) {
		errors.destination = defaultError;
	}

	return function() {
		return errors;
	};
}

describe( 'Shipping label Actions', () => {
	describe( '#openPrintingFlow', () => {
		describe( 'origin validation ignored', () => {
			const dispatchSpy = sinon.spy();

			openPrintingFlow()(
				dispatchSpy,
				createGetStateFn( { origin: { ignoreValidation: true } } ),
				context,
				createGetFormErrorsFn(
					{ setOriginError: false, setDestinationError: false }
				)
			);

			it( 'toggle origin', () => {
				expect( dispatchSpy.calledWith( {
					stepName: 'origin', type: 'TOGGLE_STEP',
				} ) )
					.to.equal( true );
			} );
			it( 'do not toggle destination', () => {
				expect( dispatchSpy.calledWith( {
					stepName: 'destination', type: 'TOGGLE_STEP',
				} ) )
					.to.equal( false );
			} );
			it( 'open printing flow', () => {
				expect( dispatchSpy.calledWith( {
					type: 'OPEN_PRINTING_FLOW',
				} ) )
					.to.equal( true );
			} );
		} );

		describe( 'origin errors exist', () => {
			const dispatchSpy = sinon.spy();

			openPrintingFlow()(
				dispatchSpy,
				createGetStateFn(),
				context,
				createGetFormErrorsFn(
					{ setOriginError: true, setDestinationError: false }
				)
			);

			it( 'toggles origin', () => {
				expect( dispatchSpy.calledWith( {
					stepName: 'origin', type: 'TOGGLE_STEP',
				} ) ).to.equal( true );
			} );
			it( 'do not toggle destination', () => {
				expect( dispatchSpy.calledWith( {
					stepName: 'destination', type: 'TOGGLE_STEP',
				} ) ).to.equal( false );
			} );
			it( 'open printing flow', () => {
				expect( dispatchSpy.calledWith( {
					type: 'OPEN_PRINTING_FLOW',
				} ) ).to.equal( true );
			} );
		} );

		describe( 'destination validation ignored', () => {
			const dispatchSpy = sinon.spy();

			openPrintingFlow()(
				dispatchSpy,
				createGetStateFn( {
					destination: { ignoreValidation: true },
				} ),
				context,
				createGetFormErrorsFn(
					{ setOriginError: false, setDestinationError: false }
				)
			);

			it( 'toggle destination', () => {
				expect( dispatchSpy.calledWith( {
					stepName: 'destination', type: 'TOGGLE_STEP',
				} ) ).to.equal( true );
			} );
			it( 'do not toggle origin', () => {
				expect( dispatchSpy.calledWith( {
					stepName: 'origin', type: 'TOGGLE_STEP',
				} ) ).to.equal( false );
			} );
			it( 'open printing flow', () => {
				expect( dispatchSpy.calledWith( {
					type: 'OPEN_PRINTING_FLOW',
				} ) ).to.equal( true );
			} );
		} );

		describe( 'destination errors exist', () => {
			const dispatchSpy = sinon.spy();

			openPrintingFlow()(
				dispatchSpy,
				createGetStateFn(),
				context,
				createGetFormErrorsFn(
					{ setOriginError: false, setDestinationError: true }
				)
			);

			it( 'toggle destination', () => {
				expect( dispatchSpy.calledWith( {
					stepName: 'destination', type: 'TOGGLE_STEP',
				} ) ).to.equal( true );
			} );
			it( 'do not toggle origin', () => {
				expect( dispatchSpy.calledWith( {
					stepName: 'origin', type: 'TOGGLE_STEP',
				} ) ).to.equal( false );
			} );
			it( 'open printing flow', () => {
				expect( dispatchSpy.calledWith( {
					type: 'OPEN_PRINTING_FLOW',
				} ) ).to.equal( true );
			} );
		} );
	} );
} );
