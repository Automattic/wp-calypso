/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	NPS_SURVEY_SUBMIT_REQUESTING,
	NPS_SURVEY_SUBMIT_REQUEST_FAILURE,
	NPS_SURVEY_SUBMIT_REQUEST_SUCCESS,
	NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUESTING,
	NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUEST_FAILURE,
	NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUEST_SUCCESS,
} from 'state/action-types';
import {
	NOT_SUBMITTED,
	SUBMITTING,
	SUBMIT_FAILURE,
	SUBMITTED,
} from '../constants';
import reducer, { surveyState, surveyName, score } from '../reducer';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'surveyState',
			'surveyName',
			'score',
		] );
	} );

	describe( '#surveyState()', () => {
		it( 'should default to not submitted', () => {
			const state = surveyState( undefined, {} );

			expect( state ).to.equal( NOT_SUBMITTED );
		} );

		it( 'should track if submitting', () => {
			const state = surveyState( undefined, {
				type: NPS_SURVEY_SUBMIT_REQUESTING,
				surveyName: 'boo',
				score: 7
			} );

			expect( state ).to.equal( SUBMITTING );
		} );

		it( 'should track if submitted', () => {
			const state = surveyState( undefined, {
				type: NPS_SURVEY_SUBMIT_REQUEST_SUCCESS,
			} );

			expect( state ).to.equal( SUBMITTED );
		} );

		it( 'should track if failed to submit', () => {
			const state = surveyState( undefined, {
				type: NPS_SURVEY_SUBMIT_REQUEST_FAILURE,
			} );

			expect( state ).to.equal( SUBMIT_FAILURE );
		} );

		it( 'should track if submitting with no score', () => {
			const state = surveyState( undefined, {
				type: NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUESTING,
				surveyName: 'boo',
			} );

			expect( state ).to.equal( SUBMITTING );
		} );

		it( 'should track if submitted with no score', () => {
			const state = surveyState( undefined, {
				type: NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUEST_SUCCESS,
			} );

			expect( state ).to.equal( SUBMITTED );
		} );

		it( 'should track if failed to submit with no score', () => {
			const state = surveyState( undefined, {
				type: NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUEST_FAILURE,
			} );

			expect( state ).to.equal( SUBMIT_FAILURE );
		} );
	} );

	describe( '#surveyName()', () => {
		it( 'should default to null', () => {
			const state = surveyName( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should track if submitting', () => {
			const state = surveyName( undefined, {
				type: NPS_SURVEY_SUBMIT_REQUESTING,
				surveyName: 'boo',
				score: 7
			} );

			expect( state ).to.equal( 'boo' );
		} );

		it( 'should track if submitting with no score', () => {
			const state = surveyName( undefined, {
				type: NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUESTING,
				surveyName: 'boo',
			} );

			expect( state ).to.equal( 'boo' );
		} );
	} );

	describe( '#score()', () => {
		it( 'should default to null', () => {
			const state = score( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should track if submitting', () => {
			const state = score( undefined, {
				type: NPS_SURVEY_SUBMIT_REQUESTING,
				surveyName: 'boo',
				score: 7
			} );

			expect( state ).to.equal( 7 );
		} );

		it( 'should track if submitting with no score', () => {
			const state = score( undefined, {
				type: NPS_SURVEY_SUBMIT_WITH_NO_SCORE_REQUESTING,
				surveyName: 'boo',
			} );

			expect( state ).to.equal( null );
		} );
	} );
} );
