/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { FEATURE_WOOP, PLAN_FREE } from '@automattic/calypso-products';
import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import ThemeQueryManager from 'calypso/lib/query-manager/theme';
import { useIsThemeAllowedOnSite } from '../use-is-theme-allowed-on-site';

jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn(),
} ) );

jest.mock( 'calypso/data/themes/use-tier-retained-benefits-query', () => ( {
	useTierRetainedBenefitsQuery: jest.fn(),
} ) );

const freeThemeTier = {
	slug: 'free',
	name: 'Free',
	plan: PLAN_FREE,
	feature: FEATURE_WOOP,
};

const twentysixteen = {
	id: 'twentysixteen',
	name: 'Twenty Sixteen',
	author: 'the WordPress team',
	screenshot:
		'https://i0.wp.com/theme.wordpress.com/wp-content/themes/pub/twentysixteen/screenshot.png',
	stylesheet: 'pub/twentysixteen',
	demo_uri: 'https://twentysixteendemo.wordpress.com/',
	author_uri: 'https://wordpress.org/',
	theme_tier: freeThemeTier,
};

describe( '#useIsThemeAllowedOnSite', () => {
	test( 'returns true if the user has the required feature', () => {
		useSelector.mockImplementation( ( selector ) =>
			selector( {
				sites: {
					features: {
						1: {
							data: {
								active: [ FEATURE_WOOP ],
							},
						},
					},
				},
				themes: {
					queries: {
						wpcom: new ThemeQueryManager( {
							items: { twentysixteen },
						} ),
					},
				},
			} )
		);

		const { result } = renderHook( () => useIsThemeAllowedOnSite( 1, 'twentysixteen' ) );
		expect( result.current ).toEqual( true );
	} );
	test( 'returns false if the user does not have the required feature', () => {
		useSelector.mockImplementation( ( selector ) =>
			selector( {
				sites: {
					features: {
						1: {
							data: {
								active: [],
							},
						},
					},
				},
				themes: {
					queries: {
						wpcom: new ThemeQueryManager( {
							items: { twentysixteen },
						} ),
					},
				},
			} )
		);

		const { result } = renderHook( () => useIsThemeAllowedOnSite( 1, 'twentysixteen' ) );
		expect( result.current ).toEqual( false );
	} );
} );
