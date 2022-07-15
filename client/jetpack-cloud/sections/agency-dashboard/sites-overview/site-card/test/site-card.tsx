/**
 * @jest-environment jsdom
 */

import { render, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { siteColumns } from '../../utils';
import SiteCard from '../index';
import type { SiteData } from '../../types';

describe( '<SiteCard>', () => {
	test( 'should render correctly and expand card on click', () => {
		const siteObj = {
			blog_id: 1234,
			url: 'test.jurassic.ninja',
			url_with_scheme: 'https://test.jurassic.ninja/',
			monitor_active: false,
			monitor_site_status: false,
			has_scan: true,
			has_backup: false,
			latest_scan_threats_found: [],
			latest_backup_status: '',
			is_connection_healthy: true,
			awaiting_plugin_updates: [],
			is_favorite: false,
		};
		const rows: SiteData = {
			site: {
				value: siteObj,
				error: true,
				type: 'site',
				status: '',
			},
			backup: {
				type: 'backup',
				status: '',
				value: '',
			},
			monitor: { error: false, type: 'monitor', status: '', value: '' },
			scan: { threats: 3, type: 'scan', status: 'failed', value: '3 Threats' },
			plugin: { updates: 3, type: 'plugin', status: 'warning', value: '3 Available' },
		};
		const initialState = {};
		const mockStore = configureStore();
		const store = mockStore( initialState );
		const queryClient = new QueryClient();

		const { container } = render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<SiteCard rows={ rows } columns={ siteColumns } />
				</QueryClientProvider>
			</Provider>
		);

		const [ expandedContentBeforeClick ] = container.getElementsByClassName(
			'site-card__expanded-content'
		);
		expect( expandedContentBeforeClick ).toBeFalsy();

		const [ header ] = container.getElementsByClassName( 'site-card__title' );

		fireEvent.click( header );

		const [ expandedContent ] = container.getElementsByClassName( 'site-card__expanded-content' );

		expect( expandedContent ).toBeInTheDocument();
	} );
} );
