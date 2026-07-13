/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { clearHostingDashboardStorage } from '../clear-hosting-dashboard-storage';

jest.mock( '@automattic/calypso-config', () => jest.fn() );

const mockConfig = config as unknown as jest.Mock;

function getIframe(): HTMLIFrameElement | null {
	return document.querySelector( 'iframe' );
}

describe( 'clearHostingDashboardStorage', () => {
	afterEach( () => {
		getIframe()?.remove();
		jest.useRealTimers();
	} );

	it( 'resolves immediately when no URL is configured', async () => {
		mockConfig.mockReturnValue( false );

		await clearHostingDashboardStorage();

		expect( getIframe() ).toBeNull();
	} );

	it( 'loads the configured URL in a hidden iframe and resolves on the done message', async () => {
		mockConfig.mockReturnValue( 'https://my.wordpress.com/clear-storage' );

		const promise = clearHostingDashboardStorage();
		const iframe = getIframe();
		expect( iframe ).not.toBeNull();
		expect( iframe?.src ).toBe( 'https://my.wordpress.com/clear-storage' );
		expect( iframe?.hidden ).toBe( true );

		window.dispatchEvent(
			new MessageEvent( 'message', {
				data: 'clear-storage:done',
				source: iframe?.contentWindow,
			} )
		);

		await promise;
		expect( getIframe() ).toBeNull();
	} );

	it( 'ignores messages from other sources', async () => {
		jest.useFakeTimers();
		mockConfig.mockReturnValue( 'https://my.wordpress.com/clear-storage' );

		const promise = clearHostingDashboardStorage( 2000 );

		window.dispatchEvent( new MessageEvent( 'message', { data: 'clear-storage:done' } ) );
		expect( getIframe() ).not.toBeNull();

		jest.advanceTimersByTime( 2000 );
		await promise;
		expect( getIframe() ).toBeNull();
	} );

	it( 'resolves after the timeout when no message arrives', async () => {
		jest.useFakeTimers();
		mockConfig.mockReturnValue( 'https://my.wordpress.com/clear-storage' );

		const promise = clearHostingDashboardStorage( 500 );
		expect( getIframe() ).not.toBeNull();

		jest.advanceTimersByTime( 500 );
		await promise;
		expect( getIframe() ).toBeNull();
	} );
} );
