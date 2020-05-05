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
import QueryJetpackScan from 'components/data/query-jetpack-scan';
import * as jetpackScanActions from 'state/jetpack-scan/actions';
import { JETPACK_SCAN_REQUEST } from 'state/action-types';

function setup( siteId ) {
	// Set spy on action creator to verify it gets called when the component renders.
	const requestScanStatusActionSpy = jest.spyOn( jetpackScanActions, 'requestScanStatus' );

	const initialState = {
		jetpackScan: { requestStatus: siteId },
	};

	const store = createStore( ( state ) => state, initialState );

	// eslint-disable-next-line no-shadow
	const renderUI = ( siteId ) => (
		<Provider store={ store }>
			<QueryJetpackScan siteId={ siteId } />
		</Provider>
	);

	const utils = render( renderUI( siteId ) );

	return { renderUI, utils, requestScanStatusActionSpy };
}

describe( 'QueryJetpackScan', () => {
	it( 'should not dispatch the action if the siteId is null ', () => {
		const siteId = null;
		const { requestScanStatusActionSpy } = setup( siteId );
		expect( requestScanStatusActionSpy ).not.toHaveBeenCalled();
	} );

	it( 'should request Jetpack Scan status every time siteId changes', () => {
		const siteId = 9999;
		const { renderUI, requestScanStatusActionSpy, utils } = setup( siteId );
		expect( requestScanStatusActionSpy ).toHaveBeenCalled();
		expect( requestScanStatusActionSpy ).toHaveBeenCalledWith( siteId );
		expect( requestScanStatusActionSpy ).toHaveBeenCalledTimes( 1 );
		expect( requestScanStatusActionSpy ).toHaveReturnedWith(
			expect.objectContaining( {
				type: JETPACK_SCAN_REQUEST,
				siteId,
			} )
		);

		const newSiteId = 10000;
		utils.rerender( renderUI( newSiteId ) );
		expect( requestScanStatusActionSpy ).toHaveBeenCalledWith( newSiteId );
		expect( requestScanStatusActionSpy ).toHaveBeenCalledTimes( 2 );
		expect( requestScanStatusActionSpy ).toHaveReturnedWith(
			expect.objectContaining( {
				type: JETPACK_SCAN_REQUEST,
				siteId: newSiteId,
			} )
		);
	} );
} );
