/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { recordTrack } from '../tracks-utils';

describe( 'recordTrack', () => {
	it( 'should be a function', () => {
		expect( recordTrack ).to.be.a( 'function' );
	} );

	it( 'should curry the tracks object', () => {
		const tracksSpy = {
			recordEvent: spy(),
		};

		expect( recordTrack( tracksSpy, noop ) ).to.be.a( 'function' );
	} );

	it( 'should call tracks to record an event with properties', () => {
		const tracksSpy = {
			recordEvent: spy(),
		};

		const eventProps = {
			a: 1,
			b: 2.2,
			c: '3',
		};

		const tracksStore = {
			isTestSite: function() {
				return false;
			},
		};

		recordTrack( tracksSpy, noop, tracksStore )( 'woocommerce_tracks_utils_test', eventProps );

		expect( tracksSpy.recordEvent ).to.have.been.calledWith(
			'woocommerce_tracks_utils_test',
			eventProps
		);
	} );

	it( 'should log tracks via debug', () => {
		const debugSpy = spy();

		const eventProps = { a: 1 };

		const tracksStore = {
			isTestSite: function() {
				return false;
			},
		};

		recordTrack( { recordEvent: noop }, debugSpy, tracksStore )(
			'woocommerce_tracks_utils_test',
			eventProps
		);

		expect( debugSpy ).to.have.been.calledWith(
			"track 'woocommerce_tracks_utils_test': ",
			eventProps
		);
	} );

	it( 'should ignore and debug log tracks with an improper event name', () => {
		const tracksSpy = {
			recordEvent: spy(),
		};
		const debugSpy = spy();

		recordTrack( tracksSpy, debugSpy )( 'somethingelse_invalid_name', { a: 1 } );

		expect( tracksSpy.recordEvent ).to.not.have.been.called;
		expect( debugSpy ).to.have.been.calledWith(
			"invalid store track name: 'somethingelse_invalid_name', must start with 'woocommerce_'"
		);
	} );

	it( 'should ignore and debug log tracks for test sites', () => {
		const tracksSpy = {
			recordEvent: spy(),
		};
		const debugSpy = spy();

		const tracksStore = {
			isTestSite: function() {
				return true;
			},
		};

		recordTrack( tracksSpy, debugSpy, tracksStore )( 'woocommerce_tracks_utils_test', {
			a: 1,
		} );

		expect( tracksSpy.recordEvent ).to.not.have.been.called;
		expect( debugSpy ).to.have.been.calledWith(
			'track request discarded. this site is flagged with `dotcom-store-test-site`'
		);
	} );
} );
