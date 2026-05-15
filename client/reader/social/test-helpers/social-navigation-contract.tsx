/**
 * Shared test contract for per-protocol Reader Social navigation components
 * (atmosphere / mastodon / fediverse).
 *
 * Every protocol's `<XxxNavigation>` renders the same `SectionNav` + `NavTabs`
 * shell — the only protocol-specific bits are the set of tabs, the route
 * prefix, and (optionally) the Tracks event name fired on click. Each protocol's
 * `*-navigation.test.tsx` calls `runSocialNavigationContract(...)` with its
 * concrete config; this helper hosts the actual `describe`/`it` blocks so we
 * have one place that asserts the contract and three tiny wrappers that bind
 * it.
 *
 * The helper itself lives under `test-helpers/` (not `test/`) so the Jest
 * `testMatch` pattern (`<rootDir>/**\/test/*.[jt]s?(x)`) does not pick it up
 * as a top-level test file. The `jest/no-export` rule, however, fires
 * file-wide on any module that calls `describe` / `it`; the exports here are
 * intentional — they are the public API of the shared contract — so the rule
 * is disabled below.
 */
/* eslint-disable jest/no-export */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import type { ComponentType } from 'react';

export interface SocialNavigationTab {
	/** Tab label as rendered (e.g. 'Timeline'). Matched case-insensitively. */
	label: string;
	/** Expected `href` on the rendered `<a role="menuitem">`. */
	href: string;
	/** Tab slug — used as the `tab` prop in the click Tracks event. */
	slug: string;
}

export interface SocialNavigationContractConfig< Props > {
	/** Protocol display name used in the suite description. */
	name: string;
	/** The protocol's navigation component under test. */
	Component: ComponentType< Props >;
	/** Tabs in render order. The first tab is treated as the default selection. */
	tabs: SocialNavigationTab[];
	/** Build the component's props for a given selected-tab slug. */
	buildProps: ( selectedTabSlug: string ) => Props;
	/**
	 * Optional Tracks event expectation. When omitted, the click-records-event
	 * test is skipped (fediverse currently has no such test; atmosphere and
	 * mastodon do).
	 *
	 * `setup` returns a `getCalls` reader so the contract can install the mock
	 * (e.g. via `jest.mock` at module scope) and the contract can inspect calls
	 * without owning the mocking strategy.
	 */
	tracksClick?: {
		eventName: string;
		setup: () => {
			getCalls: () => unknown[][];
			reset: () => void;
			teardown?: () => void;
		};
		/** Slug to click; defaults to the second tab. */
		clickSlug?: string;
		/** Props to pass to the component for the click test. */
		buildClickProps: () => Props;
		/** Build the expected payload from the click. */
		buildExpectedPayload: ( tabSlug: string ) => Record< string, unknown >;
	};
}

export function runSocialNavigationContract< Props >(
	config: SocialNavigationContractConfig< Props >
): void {
	const { name, Component, tabs, buildProps, tracksClick } = config;

	describe( `${ name } navigation contract`, () => {
		// NavTabs uses IntersectionObserver which jsdom does not provide.
		beforeAll( () => {
			global.IntersectionObserver = class IntersectionObserver {
				observe() {}
				unobserve() {}
				disconnect() {}
			} as unknown as typeof global.IntersectionObserver;
		} );

		afterAll( () => {
			// @ts-expect-error -- cleaning up the stub
			delete global.IntersectionObserver;
		} );

		const selectedSlug = tabs[ tabs.length - 1 ].slug;
		const selectedLabel = tabs[ tabs.length - 1 ].label;

		it( `renders ${ tabs.length } tab(s) and marks the selected one active`, () => {
			renderWithProvider( <Component { ...buildProps( selectedSlug ) } /> );

			for ( const tab of tabs ) {
				const re = new RegExp( tab.label, 'i' );
				expect( screen.getByRole( 'menuitem', { name: re } ) ).toBeVisible();
			}

			const items = screen.getAllByRole( 'menuitem' );
			expect( items ).toHaveLength( tabs.length );
			tabs.forEach( ( tab, index ) => {
				const re = new RegExp( tab.label, 'i' );
				expect( items[ index ] ).toHaveTextContent( re );
			} );

			const selectedRe = new RegExp( selectedLabel, 'i' );
			expect( screen.getByRole( 'menuitem', { name: selectedRe } ) ).toHaveAttribute(
				'aria-current',
				'true'
			);

			// Every other tab must report itself as inactive — guards against the
			// active class leaking onto multiple tabs at once.
			for ( const tab of tabs ) {
				if ( tab.slug === selectedSlug ) {
					continue;
				}
				const re = new RegExp( tab.label, 'i' );
				expect( screen.getByRole( 'menuitem', { name: re } ) ).toHaveAttribute(
					'aria-current',
					'false'
				);
			}
		} );

		it( 'links each tab to its route', () => {
			renderWithProvider( <Component { ...buildProps( tabs[ 0 ].slug ) } /> );

			for ( const tab of tabs ) {
				const re = new RegExp( tab.label, 'i' );
				expect( screen.getByRole( 'menuitem', { name: re } ) ).toHaveAttribute( 'href', tab.href );
			}
		} );

		if ( tracksClick ) {
			const {
				eventName,
				setup,
				clickSlug = tabs[ tabs.length - 1 ].slug,
				buildClickProps,
				buildExpectedPayload,
			} = tracksClick;

			describe( 'click tracking', () => {
				const handle = setup();

				beforeEach( () => {
					handle.reset();
				} );

				afterAll( () => {
					handle.teardown?.();
				} );

				it( 'records a tracks event when a tab is clicked', async () => {
					const clickTab = tabs.find( ( tab ) => tab.slug === clickSlug );
					if ( ! clickTab ) {
						throw new Error( `Tracks click test misconfigured: no tab with slug "${ clickSlug }"` );
					}

					const user = userEvent.setup();
					renderWithProvider( <Component { ...buildClickProps() } /> );

					const re = new RegExp( clickTab.label, 'i' );
					await user.click( screen.getByRole( 'menuitem', { name: re } ) );

					const calls = handle.getCalls();
					expect( calls ).toContainEqual( [ eventName, buildExpectedPayload( clickTab.slug ) ] );
				} );
			} );
		}
	} );
}
