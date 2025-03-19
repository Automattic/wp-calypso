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
		renderWithProvider( <HostingOverview /> );
	} );

	it( 'should work using the stateful provider', async () => {
		statefulRenderWithProvider( <HostingOverview /> );
	} );
} );
