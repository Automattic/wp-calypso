import { recordTrack } from '../tracks-utils';

const noop = () => {};

describe( 'recordTrack', () => {
	it( 'should curry the tracks object', () => {
		const tracksSpy = {
			recordTracksEvent: jest.fn(),
		};

		expect( recordTrack( tracksSpy, noop ) ).toBeInstanceOf( Function );
	} );

	it( 'should call tracks to record an event with properties', () => {
		const tracksSpy = {
			recordTracksEvent: jest.fn(),
		};

		const eventProps = {
			a: 1,
			b: 2.2,
			c: '3',
		};

		recordTrack( tracksSpy, noop )( 'calypso_woocommerce_tracks_utils_test', eventProps );

		expect( tracksSpy.recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_woocommerce_tracks_utils_test',
			eventProps
		);
	} );

	it( 'should log tracks via debug', () => {
		const debugSpy = jest.fn();

		const eventProps = { a: 1 };

		recordTrack( { recordTracksEvent: noop }, debugSpy )(
			'calypso_woocommerce_tracks_utils_test',
			eventProps
		);

		expect( debugSpy ).toHaveBeenCalledWith(
			"track 'calypso_woocommerce_tracks_utils_test': ",
			eventProps
		);
	} );

	it( 'should ignore and debug log tracks with an improper event name', () => {
		const tracksSpy = {
			recordTracksEvent: jest.fn(),
		};
		const debugSpy = jest.fn();

		recordTrack( tracksSpy, debugSpy )( 'calypso_somethingelse_invalid_name', { a: 1 } );

		expect( tracksSpy.recordTracksEvent ).not.toHaveBeenCalled();
		expect( debugSpy ).toHaveBeenCalledWith(
			"invalid store track name: 'calypso_somethingelse_invalid_name', must start with 'calypso_woocommerce_'"
		);
	} );
} );
