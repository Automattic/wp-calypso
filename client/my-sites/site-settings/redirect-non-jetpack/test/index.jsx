/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import redirectNonJetpack from '..';

jest.mock( '@automattic/calypso-router', () => jest.fn() );

jest.mock( 'calypso/state/selectors/is-site-automated-transfer', () => jest.fn() );

jest.mock( 'calypso/state/sites/selectors', () => ( {
	isJetpackSite: jest.fn(),
} ) );

jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: jest.fn(),
	getSelectedSiteSlug: jest.fn(),
} ) );

describe( 'redirectNonJetpack', () => {
	const WrappedComponent = () => <div>Wrapped component</div>;
	const RedirectNonJetpackComponent = redirectNonJetpack()( WrappedComponent );
	const mockStore = configureStore();
	const store = mockStore( {} );

	beforeEach( () => {
		page.mockClear();
		isSiteAutomatedTransfer.mockReturnValue( false );
		isJetpackSite.mockReturnValue( false );
		getSelectedSiteId.mockReturnValue( 123 );
		getSelectedSiteSlug.mockReturnValue( 'example.com' );
	} );

	test( 'does not redirect when the route explicitly skips non-Jetpack redirects', () => {
		render(
			<Provider store={ store }>
				<RedirectNonJetpackComponent siteId={ 123 } siteSlug="example.com" skipRedirectNonJetpack />
			</Provider>
		);

		expect( page ).not.toHaveBeenCalled();
	} );
} );
