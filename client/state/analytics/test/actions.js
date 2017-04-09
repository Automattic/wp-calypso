/**
 * External dependencies
 */
import { flowRight } from 'lodash';
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import {
	ANALYTICS_MULTI_TRACK,
	ANALYTICS_STAT_BUMP,
} from 'state/action-types';
import {
	composeAnalytics,
	withAnalytics,
	bumpStat
} from '../actions.js';

describe( 'middleware', () => {
	describe( 'actions', () => {
		it( 'should wrap an existing action', () => {
			const testAction = { type: 'RETICULATE_SPLINES' };
			const statBump = bumpStat( 'splines', 'reticulated_count' );
			const expected = Object.assign( statBump, testAction );
			const composite = withAnalytics( statBump, testAction );

			expect( composite ).to.deep.equal( expected );
		} );

		it( 'should trigger analytics and run passed thunks', () => {
			const dispatch = spy();
			const testAction = dispatcher => dispatcher( { type: 'test' } );
			const statBump = bumpStat( 'splines', 'reticulated_count' );

			withAnalytics( statBump, testAction )( dispatch );
			expect( dispatch ).to.have.been.calledTwice;
		} );

		it( 'should compose multiple analytics calls', () => {
			const composite = composeAnalytics(
				bumpStat( 'spline_types', 'ocean' ),
				bumpStat( 'spline_types', 'river' )
			);
			const expected = [
				{
					type: ANALYTICS_STAT_BUMP,
					payload: { group: 'spline_types', name: 'ocean' }
				},
				{
					type: ANALYTICS_STAT_BUMP,
					payload: { group: 'spline_types', name: 'river' }
				}
			];

			expect( composite.type ).to.equal( ANALYTICS_MULTI_TRACK );
			expect( composite.meta.analytics ).to.have.lengthOf( 2 );
			expect( composite.meta.analytics ).to.deep.equal( expected );
		} );

		it( 'should compose multiple analytics calls without other actions', () => {
			const composite = composeAnalytics(
				bumpStat( 'spline_types', 'ocean' ),
				bumpStat( 'spline_types', 'river' )
			);
			const testAction = { type: 'RETICULATE_SPLINES' };
			const actual = withAnalytics( composite, testAction );

			expect( actual.type ).to.equal( testAction.type );
			expect( actual.meta.analytics ).to.have.lengthOf( 2 );
		} );

		it( 'should compose multiple analytics calls with normal actions', () => {
			const composite = flowRight(
				withAnalytics( bumpStat( 'spline_types', 'ocean' ) ),
				withAnalytics( bumpStat( 'spline_types', 'river' ) ),
				() => ( { type: 'RETICULATE_SPLINES' } )
			)();

			expect( composite.meta.analytics ).to.have.lengthOf( 2 );
		} );
	} );
} );
