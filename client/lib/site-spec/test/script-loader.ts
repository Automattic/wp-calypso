/**
 * @jest-environment jsdom
 */
import { loadSiteSpecScriptAndCSS, resetSiteSpecScriptState } from '../script-loader';
import { getSiteSpecUrlByType } from '../utils';

jest.mock( '../utils', () => ( {
	getSiteSpecUrlByType: jest.fn(),
} ) );

const mockGetUrl = getSiteSpecUrlByType as jest.Mock;

const SCRIPT_URL = 'https://widgets.example.test/site-spec/index.js';
const CSS_URL = 'https://widgets.example.test/site-spec/style.css';

/**
 * The loader resolves on the elements' onload, which jsdom never fires for a real URL.
 */
function settle( selector: string, event: 'load' | 'error' ) {
	const element = document.head.querySelector( selector );
	if ( ! element ) {
		throw new Error( `expected ${ selector } in the document` );
	}
	( element as HTMLElement )[ event === 'load' ? 'onload' : 'onerror' ]?.( new Event( event ) );
}

describe( 'loadSiteSpecScriptAndCSS', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		resetSiteSpecScriptState();
		document.head.innerHTML = '';
		mockGetUrl.mockImplementation( ( type: string ) =>
			type === 'script' ? SCRIPT_URL : CSS_URL
		);
	} );

	it( 'requests the script without waiting for the stylesheet', async () => {
		const pending = loadSiteSpecScriptAndCSS();

		// Both tags are in the document before either has loaded. The script is the far
		// larger download, so serialising it behind the CSS costs a round trip.
		expect( document.head.querySelector( `script[src="${ SCRIPT_URL }"]` ) ).toBeTruthy();
		expect( document.head.querySelector( `link[href="${ CSS_URL }"]` ) ).toBeTruthy();

		settle( `link[href="${ CSS_URL }"]`, 'load' );
		settle( `script[src="${ SCRIPT_URL }"]`, 'load' );

		await expect( pending ).resolves.toBeUndefined();
	} );

	it( 'rejects when the script fails to load', async () => {
		// The assertion is attached before the events fire: the promise rejects synchronously
		// from onerror, and an unattached rejection takes the whole suite down.
		const failed = expect( loadSiteSpecScriptAndCSS() ).rejects.toThrow( SCRIPT_URL );

		settle( `link[href="${ CSS_URL }"]`, 'load' );
		settle( `script[src="${ SCRIPT_URL }"]`, 'error' );

		await failed;
	} );

	it( 'rejects when the stylesheet fails to load', async () => {
		const failed = expect( loadSiteSpecScriptAndCSS() ).rejects.toThrow( CSS_URL );

		settle( `link[href="${ CSS_URL }"]`, 'error' );

		await failed;
	} );

	it( 'throws when a resource URL is not configured', async () => {
		mockGetUrl.mockReturnValue( null );

		await expect( loadSiteSpecScriptAndCSS() ).rejects.toThrow( 'URL not configured' );
	} );
} );
