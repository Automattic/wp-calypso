/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { recordTrack } from '../tracks-utils';

const noop = () => {};

describe( 'recordTrack', () => {
	it( 'should be a function', () => {
		expect( recordTrack ).to.be.a( 'function' );
	} );

	it( 'should curry the tracks object', () => {
		const tracksSpy = {
			recordTracksEvent: spy(),
		};

		expect( recordTrack( tracksSpy, noop ) ).to.be.a( 'function' );
	} );

	it( 'should call tracks to record an event with properties', () => {
		const tracksSpy = {
			recordTracksEvent: spy(),
		};

		const eventProps = {
			a: 1,
			b: 2.2,
			c: '3',
		};

		recordTrack( tracksSpy, noop )( 'calypso_woocommerce_tracks_utils_test', eventProps );

		expect( tracksSpy.recordTracksEvent ).to.have.been.calledWith(
			'calypso_woocommerce_tracks_utils_test',
			eventProps
		);
	} );

	it( 'should log tracks via debug', () => {
		const debugSpy = spy();

		const eventProps = { a: 1 };

		recordTrack( { recordTracksEvent: noop }, debugSpy )(
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
			recordTracksEvent: spy(),
		};
		const debugSpy = spy();

		recordTrack( tracksSpy, debugSpy )( 'calypso_somethingelse_invalid_name', { a: 1 } );

		expect( tracksSpy.recordTracksEvent ).to.not.have.been.called;
		expect( debugSpy ).to.have.been.calledWith(
			"invalid store track name: 'calypso_somethingelse_invalid_name', must start with 'calypso_woocommerce_'"
		);
	} );
} );
