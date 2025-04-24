/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { urlToSlug } from 'calypso/lib/url';
import { site } from '../../test/test-utils/constants';
import BackupStorage from '../backup-storage';

jest.mock( 'calypso/data/activity-log/use-rewindable-activity-log-query', () => {
	return jest.fn().mockReturnValue( {
		isLoading: false,
		data: [
			{
				activityTs: new Date(),
				activityName: 'backup',
				activityDescription: [
					{ children: [ { text: '5 plugins, 3 themes, 0 uploads, 1 post, 1 page' } ] },
				],
			},
		],
	} );
} );

describe( 'BackupStorage component', () => {
	const initialState = {
		sites: {
			items: {
				[ site.blog_id ]: {
					blog_id: site.blog_id,
					is_multisite: true,
					jetpack: true,
				},
			},
		},
		siteSettings: { items: {} },
		partnerPortal: {
			partner: {
				current: {
					can_issue_licenses: true,
				},
			},
		},
	};

	const mockTrackEvent = jest.fn();

	const mockStore = configureStore();
	const store = mockStore( initialState );
	const queryClient = new QueryClient();

	const Wrapper = ( { children } ) => (
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		</Provider>
	);

	it( 'renders empty content when backup is not supported on multisite', () => {
		render( <BackupStorage site={ site } trackEvent={ mockTrackEvent } hasError={ false } />, {
			wrapper: Wrapper,
		} );
		expect( screen.getByText( /backup not supported on multisite/i ) ).toBeInTheDocument();
	} );

	it( 'renders empty content when backup is not enabled', () => {
		initialState.sites.items[ site.blog_id ].is_multisite = false;
		render( <BackupStorage site={ site } trackEvent={ mockTrackEvent } hasError={ false } />, {
			wrapper: Wrapper,
		} );
		expect( screen.getByText( /see your backup/i ) ).toBeInTheDocument();
		fireEvent.click( screen.getByRole( 'button', { name: /add backup/i } ) );
		expect( mockTrackEvent ).toHaveBeenCalledWith( 'expandable_block_backup_add_click' );
	} );

	it( 'renders BackupStorageContent when backup is enabled', async () => {
		site.has_backup = true;
		render( <BackupStorage site={ site } trackEvent={ mockTrackEvent } hasError={ false } />, {
			wrapper: Wrapper,
		} );
		expect( screen.getByText( /latest backup/i ) ).toBeInTheDocument();
		expect( screen.getByText( /activity log/i ) ).toHaveAttribute(
			'href',
			`/activity-log/${ site.url }`
		);
		expect( screen.getByText( '1 post, 1 page' ) ).toBeInTheDocument();
		const promise = Promise.resolve();
		await act( () => promise );
	} );

	it( 'renders empty content when backup has error', async () => {
		site.has_backup = true;
		site.latest_backup_status = 'backup_only_error';
		render( <BackupStorage site={ site } trackEvent={ mockTrackEvent } hasError={ false } />, {
			wrapper: Wrapper,
		} );
		expect( screen.getByText( /see your backup storage/i ) ).toBeInTheDocument();
		const button = screen.getByRole( 'button', { name: /fix backup/i } );
		fireEvent.click( button );
		const siteUrlWithMultiSiteSupport = urlToSlug( site.url );
		expect( button ).toHaveAttribute( 'href', `/backup/${ siteUrlWithMultiSiteSupport }` );
		expect( mockTrackEvent ).toHaveBeenCalledWith( 'expandable_block_backup_error_click' );
	} );
} );
