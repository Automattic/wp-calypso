/**
 * External Dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import './lib/mock-olark';
import { dispatch } from './lib/mock-dispatch';

import {
	OLARK_LOCALE,
	OLARK_OPERATORS_AVAILABLE,
	OLARK_OPERATORS_AWAY,
	OLARK_READY,
	OLARK_SET_EXPANDED,
	OLARK_USER_ELIGIBILITY
} from 'state/action-types';

import {
	setOlarkExpanded,
	setOlarkLocale,
	setOlarkOperatorsAvailable,
	setOlarkOperatorsAway,
	setOlarkReady,
	setOlarkUserEligibility
} from '../actions';

describe( 'actions', function() {
	it( '#setOlarkExpanded()', function() {
		const action = setOlarkExpanded( true )( dispatch );
		expect( action ).to.eql( { type: OLARK_SET_EXPANDED, isOlarkExpanded: true } );
	} );

	it( '#setOlarkLocale()', function() {
		const action = setOlarkLocale( 'jp' )( dispatch );
		expect( action ).to.eql( { type: OLARK_LOCALE, locale: 'jp' } );
	} );

	it( '#setOlarkOperatorsAvailable()', function() {
		const action = setOlarkOperatorsAvailable()( dispatch );
		expect( action ).to.eql( { type: OLARK_OPERATORS_AVAILABLE } );
	} );

	it( '#setOlarkOperatorsAway()', function() {
		const action = setOlarkOperatorsAway()( dispatch );
		expect( action ).to.eql( { type: OLARK_OPERATORS_AWAY } );
	} );

	it( '#setOlarkReady()', function() {
		const action = setOlarkReady()( dispatch );
		expect( action ).to.eql( { type: OLARK_READY } );
	} );

	it( '#setOlarkUserEligibility()', function() {
		const action = setOlarkUserEligibility( true )( dispatch );
		expect( action ).to.eql( { type: OLARK_USER_ELIGIBILITY, isUserEligible: true } );
	} );
} );
