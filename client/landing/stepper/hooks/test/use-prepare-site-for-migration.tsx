/*
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { usePrepareSiteForMigration } from '../use-prepare-site-for-migration';

// Mock dependencies
jest.mock('@automattic/calypso-config', () => {
	const mock = () => '';
	mock.isEnabled = jest.fn();
	return mock;
});

jest.mock('calypso/lib/logstash', () => ({
	logToLogstash: jest.fn(),
}));

describe('usePrepareSiteForMigration', () => {
	const SITE_ID = 123;
	const API_ROOT = 'https://public-api.wordpress.com';

	beforeAll(() => {
		nock.disableNetConnect();
	});

	beforeEach(() => {
		nock.cleanAll();
	});

	const Wrapper =
		(queryClient: QueryClient) =>
		({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

	const render = ({ siteId }) => {
		const queryClient = new QueryClient();

		const renderResult = renderHook(() => usePrepareSiteForMigration(siteId), {
			wrapper: Wrapper(queryClient),
		});

		return {
			...renderResult,
			queryClient,
		};
	};

	it('should handle successful migration preparation', async () => {
		// Mock transfer initiation
		nock(API_ROOT)
			.post(`/wpcom/v2/sites/${SITE_ID}/transfer-with-software`)
			.reply(200, { transfer_id: 456 });

		// Mock transfer status checks
		nock(API_ROOT).get(`/wpcom/v2/sites/${SITE_ID}/transfer-with-software/456`).reply(200, {
			atomic_transfer_status: 'success',
			transfer_with_software_status: 'success',
		});

		// Mock migration key fetch
		nock(API_ROOT)
			.get(`/wpcom/v2/sites/${SITE_ID}/migration/key`)
			.reply(200, { migration_key: 'test-key-123' });

		const { result } = render({ siteId: SITE_ID });

		await waitFor(() => {
			expect(result.current).toEqual({
				detailedStatus: {
					siteTransfer: 'success',
					pluginInstallation: 'success',
					migrationKey: 'success',
				},
				softwareTransferCompleted: true,
				error: null,
				migrationKey: 'test-key-123',
			});
		});
	});

	it('should handle transfer failure', async () => {
		// Mock transfer initiation
		nock(API_ROOT)
			.post(`/wpcom/v2/sites/${SITE_ID}/transfer-with-software`)
			.reply(200, { transfer_id: 456 });

		// Mock failed transfer status
		nock(API_ROOT).get(`/wpcom/v2/sites/${SITE_ID}/transfer-with-software/456`).reply(200, {
			atomic_transfer_status: 'error',
			transfer_with_software_status: 'error',
			error: 'Transfer failed',
		});

		const { result } = render({ siteId: SITE_ID });

		await waitFor(() => {
			expect(result.current).toEqual({
				detailedStatus: {
					siteTransfer: 'error',
					pluginInstallation: 'error',
					migrationKey: 'idle',
				},
				softwareTransferCompleted: false,
				error: expect.any(Error),
				migrationKey: null,
			});
		});
	});

	it('should handle retry option', async () => {
		// Mock transfer initiation
		nock(API_ROOT)
			.post(`/wpcom/v2/sites/${SITE_ID}/transfer-with-software`)
			.reply(200, { transfer_id: 456 });

		// Mock transfer status checks with eventual success
		nock(API_ROOT)
			.get(`/wpcom/v2/sites/${SITE_ID}/transfer-with-software/456`)
			.times(2)
			.reply(200, {
				atomic_transfer_status: 'pending',
				transfer_with_software_status: 'pending',
			})
			.get(`/wpcom/v2/sites/${SITE_ID}/transfer-with-software/456`)
			.reply(200, {
				atomic_transfer_status: 'success',
				transfer_with_software_status: 'success',
			});

		// Mock migration key fetch
		nock(API_ROOT)
			.get(`/wpcom/v2/sites/${SITE_ID}/migration/key`)
			.reply(200, { migration_key: 'test-key-123' });

		const { result } = render({ siteId: SITE_ID });

		expect(result.current.detailedStatus.siteTransfer).toBe('success');
		expect(result.current.softwareTransferCompleted).toBe(true);
		expect(result.current.migrationKey).toBe('test-key-123');
	});
});
