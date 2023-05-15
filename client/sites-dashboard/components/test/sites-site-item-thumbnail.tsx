/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SiteItemThumbnail } from '../sites-site-item-thumbnail';

function makeTestSite( {
	title = 'test',
	is_coming_soon = false,
	lang = 'en',
	is_creating = false,
} = {} ) {
	return {
		ID: 1,
		title,
		slug: '',
		URL: '',
		launch_status: 'launched',
		options: {},
		jetpack: false,
		is_coming_soon,
		lang,
		is_creating,
	};
}

describe( '<SiteItemThumbnail>', () => {
	const initialState = {
		automatedTransfer: {
			1: {
				fetchingStatus: true,
				status: 'in-progress',
			},
		},
	};
	const mockStore = configureStore();
	const store = mockStore( initialState );

	describe( 'Fallback site icon', () => {
		describe( 'Intl.Segmenter API is available', () => {
			test( 'confirm Intl available', () => {
				expect( Intl.Segmenter ).toBeDefined();
			} );

			defineCommonSiteInitialTests( store );

			test( 'site title can be multi-codepoint emoji', () => {
				render(
					<Provider store={ store }>
						<SiteItemThumbnail
							displayMode="tile"
							site={ makeTestSite( { title: '👩‍👩‍👦‍👦 family: woman, woman, boy, boy' } ) }
						/>
					</Provider>
				);
				expect( screen.getByLabelText( 'Site Icon' ) ).toHaveTextContent( /^👩‍👩‍👦‍👦$/ );
			} );
		} );

		describe( 'Intl.Segmenter API is not available', () => {
			let rememberSegmenter;
			beforeAll( () => {
				rememberSegmenter = Intl.Segmenter;
				delete Intl.Segmenter;
			} );

			afterAll( () => {
				Intl.Segmenter = rememberSegmenter;
			} );

			defineCommonSiteInitialTests( store );

			test( 'site name can be multi-codepoint emoji', () => {
				// Without the Segmenter API we fall back to returning the first codepoint
				render(
					<Provider store={ store }>
						<SiteItemThumbnail
							displayMode="tile"
							site={ makeTestSite( { title: '👩‍👩‍👦‍👦 family: woman, woman, boy, boy' } ) }
						/>
					</Provider>
				);
				expect( screen.getByLabelText( 'Site Icon' ) ).toHaveTextContent( /^👩$/ );
			} );
		} );
	} );

	describe( 'Atomic transfer', () => {
		test( 'show loader when atomic transfer in progress', () => {
			const { container } = renderWithProvider(
				<Provider store={ store }>
					<SiteItemThumbnail
						displayMode="tile"
						site={ makeTestSite( { title: 'test', is_coming_soon: true, is_creating: true } ) }
					/>
				</Provider>
			);

			expect( container.querySelector( 'div[class*="Loader"]' ) ).toBeInTheDocument();
		} );

		test( 'does not show loader when atomic transfer is not in progress', () => {
			const { container } = renderWithProvider(
				<Provider store={ store }>
					<SiteItemThumbnail
						displayMode="tile"
						site={ makeTestSite( { title: 'test', is_coming_soon: true, is_creating: false } ) }
					/>
				</Provider>
			);

			expect( container.querySelector( 'div[class*="Loader"]' ) ).not.toBeInTheDocument();
		} );
	} );
} );

function defineCommonSiteInitialTests( store ) {
	test( 'an English site title', () => {
		render(
			<Provider store={ store }>
				<SiteItemThumbnail displayMode="tile" site={ makeTestSite( { title: 'hello' } ) } />
			</Provider>
		);
		expect( screen.getByLabelText( 'Site Icon' ) ).toHaveTextContent( /^h$/ );
	} );

	test( 'diacritic mark on first letter', () => {
		render(
			<Provider store={ store }>
				<SiteItemThumbnail displayMode="tile" site={ makeTestSite( { title: 'öwl' } ) } />
			</Provider>
		);
		expect( screen.getByLabelText( 'Site Icon' ) ).toHaveTextContent( /^ö$/ );
	} );

	test( 'empty site title renders no initial', () => {
		render(
			<Provider store={ store }>
				<SiteItemThumbnail displayMode="tile" site={ makeTestSite( { title: '' } ) } />
			</Provider>
		);
		expect( screen.getByLabelText( 'Site Icon' ) ).toBeEmptyDOMElement();
	} );

	test( 'undefined site title renders no initial', () => {
		const testSite = makeTestSite();
		// @ts-expect-error Let's artificially remove the title so it tries to render an empty string
		testSite.title = undefined;

		render(
			<Provider store={ store }>
				<SiteItemThumbnail displayMode="tile" site={ testSite } />
			</Provider>
		);
		expect( screen.getByLabelText( 'Site Icon' ) ).toBeEmptyDOMElement();
	} );

	test( 'shows "Coming soon" tile if site has not launched', () => {
		render(
			<Provider store={ store }>
				<SiteItemThumbnail site={ makeTestSite( { title: '', is_coming_soon: true } ) } />
			</Provider>
		);
		expect( screen.getByTitle( 'Coming Soon' ) ).toBeInTheDocument();
	} );

	test( 'shows "Coming soon" translated to site language', () => {
		render(
			<Provider store={ store }>
				<SiteItemThumbnail
					site={ makeTestSite( { title: '', is_coming_soon: true, lang: 'de-DE' } ) }
				/>
			</Provider>
		);
		expect( screen.getByTitle( 'Demnächst verfügbar' ) ).toBeInTheDocument();
	} );

	test( 'shows "Coming soon" in English when site language is not translated', () => {
		render(
			<Provider store={ store }>
				<SiteItemThumbnail
					site={ makeTestSite( { title: '', is_coming_soon: true, lang: 'zz' } ) }
				/>
			</Provider>
		);
		expect( screen.getByTitle( 'Coming Soon' ) ).toBeInTheDocument();
	} );
}
