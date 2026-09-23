/**
 * @jest-environment jsdom
 */
import {
	omnibarAgentsManagerEnabledQuery,
	omnibarSiteIdQuery,
	queryClient,
	siteByIdQuery,
} from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../../test-utils';
import useShouldLoadAgentsManager from '../../agents-manager/use-should-load-agents-manager';
import OmnibarAgentsManager from '../omnibar-agents-manager';
import type { Site } from '@automattic/api-core';

jest.mock( '../../agents-manager/use-should-load-agents-manager' );
jest.mock( '@automattic/agents-manager', () => ( {
	__esModule: true,
	default: () => <div role="region" aria-label="Agents Manager" />,
} ) );

const mockedUseShouldLoadAgentsManager = jest.mocked( useShouldLoadAgentsManager );
const siteId = 123;
const site = {
	ID: siteId,
	slug: 'example.wordpress.com',
	URL: 'https://example.wordpress.com',
} as Site;

describe( '<OmnibarAgentsManager />', () => {
	beforeEach( () => {
		queryClient.clear();
		queryClient.setQueryData( omnibarSiteIdQuery().queryKey, siteId );
		queryClient.setQueryData( siteByIdQuery( siteId ).queryKey, site );
	} );

	it( 'publishes enabled eligibility for the independently mounted omnibar', async () => {
		mockedUseShouldLoadAgentsManager.mockReturnValue( {
			routeIsEnabled: true,
			isInternalOnly: true,
		} );

		render( <OmnibarAgentsManager pathname="/sites/example.wordpress.com" />, {
			queryClient,
		} );

		expect( await screen.findByRole( 'region', { name: 'Agents Manager' } ) ).toBeVisible();
		await waitFor( () =>
			expect( queryClient.getQueryData( omnibarAgentsManagerEnabledQuery().queryKey ) ).toBe( true )
		);
	} );

	it( 'publishes disabled eligibility outside the allowlist', async () => {
		mockedUseShouldLoadAgentsManager.mockReturnValue( {
			routeIsEnabled: false,
			isInternalOnly: false,
		} );

		const { container } = render( <OmnibarAgentsManager pathname="/sites" />, { queryClient } );

		expect( container ).toBeEmptyDOMElement();
		await waitFor( () =>
			expect( queryClient.getQueryData( omnibarAgentsManagerEnabledQuery().queryKey ) ).toBe(
				false
			)
		);
	} );
} );
