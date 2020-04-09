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
	const requestJetpackScanStatusActionSpy = jest.spyOn(
		jetpackScanActions,
		'requestJetpackScanStatus'
	);

	const initialState = {
		jetpackScan: { requestStatus: siteId },
	};

	const store = createStore( state => state, initialState );

	// eslint-disable-next-line no-shadow
	const renderUI = siteId => (
		<Provider store={ store }>
			<QueryJetpackScan siteId={ siteId } />
		</Provider>
	);

	const utils = render( renderUI( siteId ) );

	return { renderUI, utils, requestJetpackScanStatusActionSpy };
}

describe( 'QueryJetpackScan', () => {
	it( 'should not dispatch the action if the siteId is null ', () => {
		const siteId = null;
		const { requestJetpackScanStatusActionSpy } = setup( siteId );
		expect( requestJetpackScanStatusActionSpy ).not.toHaveBeenCalled();
	} );

	it( 'should request Jetpack Scan status every time siteId changes', () => {
		const siteId = 9999;
		const { renderUI, requestJetpackScanStatusActionSpy, utils } = setup( siteId );
		expect( requestJetpackScanStatusActionSpy ).toHaveBeenCalled();
		expect( requestJetpackScanStatusActionSpy ).toHaveBeenCalledWith( siteId );
		expect( requestJetpackScanStatusActionSpy ).toHaveBeenCalledTimes( 1 );
		expect( requestJetpackScanStatusActionSpy ).toHaveReturnedWith(
			expect.objectContaining( {
				type: JETPACK_SCAN_REQUEST,
				siteId,
			} )
		);

		const newSiteId = 10000;
		utils.rerender( renderUI( newSiteId ) );
		expect( requestJetpackScanStatusActionSpy ).toHaveBeenCalledWith( newSiteId );
		expect( requestJetpackScanStatusActionSpy ).toHaveBeenCalledTimes( 2 );
		expect( requestJetpackScanStatusActionSpy ).toHaveReturnedWith(
			expect.objectContaining( {
				type: JETPACK_SCAN_REQUEST,
				siteId: newSiteId,
			} )
		);
	} );
} );
