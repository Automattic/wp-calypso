import { render } from '@testing-library/react';
import { recordTracksEvent } from '../../panel/helpers/stats';
import { useTracksSurface, type TracksSurface } from '../use-tracks-surface';

const Surface = ( { surface }: { surface?: TracksSurface } ) => {
	useTracksSurface( surface );
	return null;
};

type TracksWindow = Window & { _tkq: [ string, string, { surface?: string } | undefined ][] };

const tracksQueue = () => ( window as unknown as TracksWindow )._tkq;

const recordedSurface = () => {
	recordTracksEvent( 'calypso_notification_settings_click' );
	return tracksQueue().at( -1 )?.[ 2 ]?.surface;
};

describe( 'useTracksSurface', () => {
	beforeEach( () => {
		( window as unknown as TracksWindow )._tkq = [];
	} );

	it( 'names the panel while it is open over the full page, and the page again once it closes', () => {
		const page = render( <Surface surface="dashboard_page" /> );
		expect( recordedSurface() ).toBe( 'dashboard_page' );

		const panel = render( <Surface surface="dashboard_panel" /> );
		expect( recordedSurface() ).toBe( 'dashboard_panel' );

		panel.unmount();
		expect( recordedSurface() ).toBe( 'dashboard_page' );

		page.unmount();
		expect( recordedSurface() ).toBeUndefined();
	} );

	it( 'follows a host that changes its surface', () => {
		const { rerender, unmount } = render( <Surface surface="calypso_panel" /> );
		expect( recordedSurface() ).toBe( 'calypso_panel' );

		rerender( <Surface surface="calypso_reader_page" /> );
		expect( recordedSurface() ).toBe( 'calypso_reader_page' );

		rerender( <Surface /> );
		expect( recordedSurface() ).toBeUndefined();

		unmount();
	} );
} );
