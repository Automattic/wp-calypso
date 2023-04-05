/**
 * @jest-environment jsdom
 */

import { queryByAttribute, render } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import configureStore from 'redux-mock-store';
import AgenciesSurveyBanner from '../agencies-survey-banner';

const mockUseTranslate = () => ( text: string ) => text;
const mockUseDispatch = () => () => null;

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate: jest.fn(),
} ) );
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn(),
} ) );

function createState( siteId = 1, partner_types = [ 'agency' ] ) {
	return {
		currentUser: {
			capabilities: {
				[ siteId ]: {
					publish_posts: true,
				},
			},
			user: {
				jetpack_partner_types: partner_types,
			},
		},
		sites: {},
		ui: {
			selectedSiteId: siteId,
		},
		preferences: {
			remoteValues: {},
		},
	};
}

describe( 'AgenciesSurveyBanner', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		( useTranslate as jest.Mock ).mockImplementation( mockUseTranslate );
		( useDispatch as jest.Mock ).mockImplementation( mockUseDispatch );
	} );

	it( 'should render if user is an agency', () => {
		const mockStore = configureStore();
		const store = mockStore( createState() );

		const { container } = render(
			<Provider store={ store }>
				<AgenciesSurveyBanner />
			</Provider>
		);

		expect( container.firstChild ).not.toBeNull();
		expect( container.firstChild ).toHaveClass( 'backup__agencies-survey-banner' );
		// Make sure the close button is rendered
		expect(
			queryByAttribute( 'class', container, 'dismissible-card__close-button' )
		).not.toBeNull();
	} );

	it( "shouldn't render if user is not an agency", () => {
		const mockStore = configureStore();
		const store = mockStore( createState( 1, [] ) );

		const { container } = render(
			<Provider store={ store }>
				<AgenciesSurveyBanner />
			</Provider>
		);

		expect( container.firstChild ).toBeNull();
	} );
} );
