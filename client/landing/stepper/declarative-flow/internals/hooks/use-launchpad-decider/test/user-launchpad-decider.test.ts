/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useLaunchpadDecider } from '..';

test( 'appends siteId and sitdSlug to the post-flow url', () => {
	const exitFlow = jest.fn();
	const navigate = jest.fn();

	const { result } = renderHook( () => useLaunchpadDecider( { exitFlow, navigate } ) );

	const postFlowUrl = result.current.getPostFlowUrl( {
		flow: 'flow-name',
		siteId: '1234',
		siteSlug: 'site.wordpress.com',
	} );

	expect( postFlowUrl ).toBe(
		'/setup/flow-name/launchpad?siteSlug=site.wordpress.com&siteId=1234'
	);
} );

test( "doesn't append empty siteId to the post-flow url", () => {
	const exitFlow = jest.fn();
	const navigate = jest.fn();

	const { result } = renderHook( () => useLaunchpadDecider( { exitFlow, navigate } ) );

	const nullSiteIdUrl = result.current.getPostFlowUrl( {
		flow: 'flow-name',
		siteSlug: 'site.wordpress.com',
		siteId: null,
	} );
	expect( nullSiteIdUrl ).toBe( '/setup/flow-name/launchpad?siteSlug=site.wordpress.com' );

	const emptySiteId = result.current.getPostFlowUrl( {
		flow: 'flow-name',
		siteSlug: 'site.wordpress.com',
		siteId: '',
	} );
	expect( emptySiteId ).toBe( '/setup/flow-name/launchpad?siteSlug=site.wordpress.com' );

	const zeroSiteId = result.current.getPostFlowUrl( {
		flow: 'flow-name',
		siteSlug: 'site.wordpress.com',
		siteId: 0,
	} );
	expect( zeroSiteId ).toBe( '/setup/flow-name/launchpad?siteSlug=site.wordpress.com' );
} );

test( "doesn't append empty siteSlug to the post-flow url", () => {
	const exitFlow = jest.fn();
	const navigate = jest.fn();

	const { result } = renderHook( () => useLaunchpadDecider( { exitFlow, navigate } ) );

	const emptySiteSlug = result.current.getPostFlowUrl( {
		flow: 'flow-name',
		siteSlug: '',
		siteId: '1234',
	} );
	expect( emptySiteSlug ).toBe( '/setup/flow-name/launchpad?siteId=1234' );
} );
