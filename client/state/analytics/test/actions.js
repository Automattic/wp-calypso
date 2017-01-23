/**
 * External dependencies
 */
import flowRight from 'lodash/flowRight';
import { expect } from 'chai';
import { useSandbox } from 'test/helpers/use-sinon';

/**
 * Internal dependencies
 */
import {
	ANALYTICS_MULTI_TRACK,
	ANALYTICS_EVENT_RECORD
} from 'state/action-types';

import {
	composeAnalytics,
	recordEventOnce,
	withAnalytics,
	bumpStat
} from '../actions.js';

describe( 'middleware', () => {
	let spy;
	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	describe( 'actions', () => {
		it( 'should wrap an existing action', () => {
			const testAction = { type: 'RETICULATE_SPLINES' };
			const statBump = bumpStat( 'splines', 'reticulated_count' );
			const expected = Object.assign( statBump, testAction );
			const composite = withAnalytics( statBump, testAction );

			expect( composite ).to.deep.equal( expected );
		} );

		it( 'should trigger analytics and run passed thunks', () => {
			const testAction = dispatcher => dispatcher( { type: 'test' } );
			const statBump = bumpStat( 'splines', 'reticulated_count' );

			withAnalytics( statBump, testAction )( spy );
			expect( spy ).to.have.been.calledTwice;
		} );

		it( 'should compose multiple analytics calls', () => {
			const composite = composeAnalytics(
				bumpStat( 'spline_types', 'ocean' ),
				bumpStat( 'spline_types', 'river' )
			);

			expect( composite.type ).to.equal( ANALYTICS_MULTI_TRACK );
			expect( composite.meta.analytics ).to.have.lengthOf( 2 );
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

	describe( 'recordEventOnce', () => {
		it( 'should dispatch the record event action only once', () => {
			recordEventOnce( 'ribs', 'ga', { label: 'label' } )( spy );
			recordEventOnce( 'ribs', 'ga', { label: 'label' } )( spy );

			expect( spy ).to.have.been.calledOnce;
			expect( spy ).to.have.been.calledWith( {
				type: ANALYTICS_EVENT_RECORD,
				meta: {
					analytics: [ {
						type: ANALYTICS_EVENT_RECORD,
						payload: {
							service: 'ga',
							label: 'label'
						}
					} ]
				}
			} );
		} );
	} );
} );
