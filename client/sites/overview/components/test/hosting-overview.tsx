/**
 * @jest-environment jsdom
 */
import React from 'react';
import {
	renderWithProvider,
	statefulRenderWithProvider,
} from 'calypso/test-helpers/testing-library';
import HostingOverview from '../hosting-overview';

describe( 'HostingOverview', () => {
	it( 'should trigger errors due to limited state tree population', async () => {
		expect( () => renderWithProvider( <HostingOverview /> ) ).toThrow();
	} );

	it( 'should work using the stateful provider', async () => {
		expect( () => statefulRenderWithProvider( <HostingOverview /> ) ).not.toThrow();
	} );
} );
