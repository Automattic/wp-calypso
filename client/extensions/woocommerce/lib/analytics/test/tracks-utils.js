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

		recordTrack( tracksSpy, noop )( 'calypso_woocommerce_tracks_utils_test', eventProps );

		expect( tracksSpy.recordEvent ).to.have.been.calledWith(
			'calypso_woocommerce_tracks_utils_test',
			eventProps
		);
	} );

	it( 'should log tracks via debug', () => {
		const debugSpy = spy();

		const eventProps = { a: 1 };

		recordTrack( { recordEvent: noop }, debugSpy )(
			'calypso_woocommerce_tracks_utils_test',
			eventProps
		);

		expect( debugSpy ).to.have.been.calledWith(
			"track 'calypso_woocommerce_tracks_utils_test': ",
			eventProps
		);
	} );

	it( 'should ignore and debug log tracks with an improper event name', () => {
		const tracksSpy = {
			recordEvent: spy(),
		};
		const debugSpy = spy();

		recordTrack( tracksSpy, debugSpy )( 'calypso_somethingelse_invalid_name', { a: 1 } );

		expect( tracksSpy.recordEvent ).to.not.have.been.called;
		expect( debugSpy ).to.have.been.calledWith(
			"invalid store track name: 'calypso_somethingelse_invalid_name', must start with 'calypso_woocommerce_'"
		);
	} );
} );
