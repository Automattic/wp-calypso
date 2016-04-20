/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getPlansBySite,
	getPlansBySiteId,
	hasDomainCredit
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getPlansBySite()', () => {
		it( 'should return plans by site', () => {
			const plans1 = { data: [ { currentPlan: false }, { currentPlan: false }, { currentPlan: true } ] };
			const plans2 = { data: [ { currentPlan: true }, { currentPlan: false }, { currentPlan: false } ] };
			const state = {
				sites: {
					plans: {
						2916284: plans1,
						77203074: plans2
					}
				}
			};
			const plans = getPlansBySite( state, { ID: 77203074 } );

			expect( plans ).to.eql( plans2 );
		} );
	} );
	describe( '#getPlansBySiteId()', () => {
		it( 'should return plans by site id', () => {
			const plans1 = { data: [ { currentPlan: false }, { currentPlan: false }, { currentPlan: true } ] };
			const plans2 = { data: [ { currentPlan: true }, { currentPlan: false }, { currentPlan: false } ] };
			const state = {
				sites: {
					plans: {
						2916284: plans1,
						77203074: plans2
					}
				}
			};
			const plans = getPlansBySiteId( state, 2916284 );

			expect( plans ).to.eql( plans1 );
		} );
	} );
	describe( '#hasDomainCredit()', () => {
		it( 'should return if plan has domain credit', () => {
			const state = {
				sites: {
					plans: {
						2916284: {
							data: [ { currentPlan: false }, { currentPlan: false }, { currentPlan: true, hasDomainCredit: false } ]
						},
						77203074: {
							data: [ { currentPlan: false }, { currentPlan: true, hasDomainCredit: true }, { currentPlan: false } ]
						}

					}
				}
			};

			expect( hasDomainCredit( state, 77203074 ) ).to.equal( true );
			expect( hasDomainCredit( state, 2916284 ) ).to.equal( false );
		} );
	} );
} );
