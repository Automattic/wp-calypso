/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';

/**
 * Internal dependencies
 */
import QueryJetpackScanHistory from 'components/data/query-jetpack-scan-history';
import * as jetpackScanActions from 'state/jetpack-scan/history/actions';
import { JETPACK_SCAN_HISTORY_REQUEST } from 'state/action-types';

function setup( siteId ) {
	// Set spy on action creator to verify it gets called when the component renders.
	const requestJetpackScanHistoryActionSpy = jest.spyOn(
		jetpackScanActions,
		'requestJetpackScanHistory'
	);

	const initialState = {
		jetpackScan: { history: { requestStatus: siteId } },
	};

	const store = createStore( ( state ) => state, initialState );

	// eslint-disable-next-line no-shadow
	const renderUI = ( siteId ) => (
		<Provider store={ store }>
			<QueryJetpackScanHistory siteId={ siteId } />
		</Provider>
	);

	const utils = render( renderUI( siteId ) );

	return { renderUI, utils, requestJetpackScanHistoryActionSpy };
}

describe( 'QueryJetpackScanHistory', () => {
	it( 'should not dispatch the action if the siteId is null ', () => {
		const siteId = null;
		const { requestJetpackScanHistoryActionSpy } = setup( siteId );
		expect( requestJetpackScanHistoryActionSpy ).not.toHaveBeenCalled();
	} );

	it( 'should request Jetpack Scan History every time siteId changes', () => {
		const siteId = 9999;
		const { renderUI, requestJetpackScanHistoryActionSpy, utils } = setup( siteId );
		expect( requestJetpackScanHistoryActionSpy ).toHaveBeenCalled();
		expect( requestJetpackScanHistoryActionSpy ).toHaveBeenCalledWith( siteId );
		expect( requestJetpackScanHistoryActionSpy ).toHaveBeenCalledTimes( 1 );
		expect( requestJetpackScanHistoryActionSpy ).toHaveReturnedWith(
			expect.objectContaining( {
				type: JETPACK_SCAN_HISTORY_REQUEST,
				siteId,
			} )
		);

		const newSiteId = 10000;
		utils.rerender( renderUI( newSiteId ) );
		expect( requestJetpackScanHistoryActionSpy ).toHaveBeenCalledWith( newSiteId );
		expect( requestJetpackScanHistoryActionSpy ).toHaveBeenCalledTimes( 2 );
		expect( requestJetpackScanHistoryActionSpy ).toHaveReturnedWith(
			expect.objectContaining( {
				type: JETPACK_SCAN_HISTORY_REQUEST,
				siteId: newSiteId,
			} )
		);
	} );
} );
