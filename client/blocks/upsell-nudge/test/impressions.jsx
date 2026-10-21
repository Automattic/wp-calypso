/**
 * @jest-environment jsdom
 */

import { recordTracksEvent } from 'calypso/state/analytics/actions';
import preferencesReducer from 'calypso/state/preferences/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import UpsellNudge from '../index';

jest.mock( 'calypso/state/analytics/actions', () => ( {
	...jest.requireActual( 'calypso/state/analytics/actions' ),
	recordTracksEvent: jest.fn( () => ( { type: 'ANALYTICS_EVENT_RECORD' } ) ),
} ) );

const PREFERENCE_NAME = 'upsell-nudge-test';

function renderNudge( { remoteValues = {}, ...props } = {} ) {
	return renderWithProvider(
		<UpsellNudge
			event="test-nudge"
			title="Upgrade your plan"
			callToAction="Upgrade"
			href="/plans"
			forceDisplay
			{ ...props }
		/>,
		{
			reducers: { preferences: preferencesReducer, ui: uiReducer },
			initialState: { preferences: { remoteValues } },
		}
	);
}

const impressions = () =>
	recordTracksEvent.mock.calls.filter( ( [ name ] ) => name === 'calypso_upsell_nudge_impression' );

describe( 'UpsellNudge impressions', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	test( 'records an impression for a dismissible banner that has not been dismissed', () => {
		renderNudge( { dismissPreferenceName: PREFERENCE_NAME } );

		expect( impressions() ).toHaveLength( 1 );
	} );

	test( 'records no impression once the banner has been dismissed', () => {
		renderNudge( {
			dismissPreferenceName: PREFERENCE_NAME,
			remoteValues: { [ `dismissible-card-${ PREFERENCE_NAME }` ]: true },
		} );

		expect( impressions() ).toHaveLength( 0 );
	} );

	test( 'records no impression before remote preferences have been received', () => {
		renderNudge( { dismissPreferenceName: PREFERENCE_NAME, remoteValues: null } );

		expect( impressions() ).toHaveLength( 0 );
	} );

	test( 'records an impression for a non-dismissible banner without waiting for preferences', () => {
		renderNudge( { remoteValues: null } );

		expect( impressions() ).toHaveLength( 1 );
	} );
} );
