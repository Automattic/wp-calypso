/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencides
 */
import { render as rtlRender, screen } from 'config/testing-library';
import HasSitePurchasesSwitch from '../index';
import { reducer as purchases } from 'calypso/state/purchases/reducer';

jest.mock( 'calypso/components/data/query-site-purchases', () => () => <p>Query</p> );

const siteId = 1;
const trueComponent = <p>True</p>;
const falseComponent = <p>False</p>;
const loadingComponent = <p>Loading</p>;
const props = {
	siteId,
	trueComponent,
	falseComponent,
	loadingComponent,
};

const getQueryElt = () => screen.getByText( /query/i );
const getLoadingElt = () => screen.getByText( /loading/i );
const getTrueElt = () => screen.getByText( /true/i );
const getFalseElt = () => screen.getByText( /false/i );
const render = ( el, options ) => rtlRender( el, { ...options, reducers: { purchases } } );

describe( 'HasSitePurchasesSwitch', () => {
	it( 'should render the loading state if data is being fetched', () => {
		render( <HasSitePurchasesSwitch { ...props } />, {
			initialState: {
				purchases: {
					isFetchingSitePurchases: true,
				},
			},
		} );

		expect( getLoadingElt() ).toBeInTheDocument();
	} );

	it( 'should render the loading state and fetch data if data has not been loaded yet', () => {
		render( <HasSitePurchasesSwitch { ...props } /> );

		expect( getLoadingElt() ).toBeInTheDocument();
		expect( getQueryElt() ).toBeInTheDocument();
	} );

	it( 'should render the correct component if site has purchases', () => {
		render( <HasSitePurchasesSwitch { ...props } />, {
			initialState: {
				purchases: {
					hasLoadedSitePurchasesFromServer: true,
					data: [ { blog_id: siteId } ],
				},
			},
		} );

		expect( getTrueElt() ).toBeInTheDocument();
	} );

	it( 'should render the correct component if site has no purchase', () => {
		render( <HasSitePurchasesSwitch { ...props } />, {
			initialState: {
				purchases: {
					hasLoadedSitePurchasesFromServer: true,
					data: [],
				},
			},
		} );

		expect( getFalseElt() ).toBeInTheDocument();
	} );
} );
