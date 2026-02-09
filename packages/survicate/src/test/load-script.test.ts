/**
 * @jest-environment jsdom
 */

import {
	loadSurvicateScript,
	isSurvicateScriptLoaded,
	resetSurvicateScriptState,
} from '../load-script';

describe( 'loadSurvicateScript', () => {
	let mockScript: {
		src: string;
		async: boolean;
		onload: ( () => void ) | null;
		onerror: ( () => void ) | null;
	};
	let mockScriptElement: { parentNode: { insertBefore: jest.Mock } };
	let originalCreateElement: typeof document.createElement;
	let originalGetElementsByTagName: typeof document.getElementsByTagName;

	beforeAll( () => {
		originalCreateElement = document.createElement;
		originalGetElementsByTagName = document.getElementsByTagName;
	} );

	beforeEach( () => {
		resetSurvicateScriptState();

		mockScript = {
			src: '',
			async: false,
			onload: null,
			onerror: null,
		};

		mockScriptElement = {
			parentNode: {
				insertBefore: jest.fn(),
			},
		};

		document.createElement = jest.fn( ( tagName: string ) => {
			if ( tagName === 'script' ) {
				return mockScript as unknown as HTMLScriptElement;
			}
			return originalCreateElement.call( document, tagName );
		} );

		document.getElementsByTagName = jest.fn( ( tagName: string ) => {
			if ( tagName === 'script' ) {
				return [ mockScriptElement ] as unknown as HTMLCollectionOf< Element >;
			}
			return originalGetElementsByTagName.call( document, tagName );
		} );
	} );

	afterAll( () => {
		document.createElement = originalCreateElement;
		document.getElementsByTagName = originalGetElementsByTagName;
	} );

	test( 'should create a script element with correct URL', () => {
		loadSurvicateScript( 'test-workspace-id' );

		expect( document.createElement ).toHaveBeenCalledWith( 'script' );
		expect( mockScript.src ).toBe(
			'https://survey.survicate.com/workspaces/test-workspace-id/web_surveys.js'
		);
		expect( mockScript.async ).toBe( true );
	} );

	test( 'should insert script into the DOM', () => {
		loadSurvicateScript( 'test-id' );

		expect( mockScriptElement.parentNode.insertBefore ).toHaveBeenCalledWith(
			mockScript,
			mockScriptElement
		);
	} );

	test( 'should resolve when script loads successfully', async () => {
		const promise = loadSurvicateScript( 'test-id' );

		mockScript.onload?.();

		await expect( promise ).resolves.toBeUndefined();
	} );

	test( 'should reject when script fails to load', async () => {
		const promise = loadSurvicateScript( 'test-id' );

		mockScript.onerror?.();

		await expect( promise ).rejects.toThrow( 'Failed to load Survicate script' );
	} );

	test( 'should not load script twice', async () => {
		const firstPromise = loadSurvicateScript( 'test-id' );
		mockScript.onload?.();
		await firstPromise;

		const secondPromise = loadSurvicateScript( 'test-id' );
		await expect( secondPromise ).resolves.toBeUndefined();

		// createElement should only be called once
		expect( document.createElement ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should report loaded immediately after load is initiated', () => {
		expect( isSurvicateScriptLoaded() ).toBe( false );

		loadSurvicateScript( 'test-id' );

		expect( isSurvicateScriptLoaded() ).toBe( true );
	} );

	test( 'should return the same promise for concurrent calls', () => {
		const promise1 = loadSurvicateScript( 'test-id' );
		const promise2 = loadSurvicateScript( 'test-id' );

		expect( promise1 ).toBe( promise2 );
		expect( document.createElement ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should reset loaded state on failure so retry is possible', async () => {
		const promise = loadSurvicateScript( 'test-id' );
		mockScript.onerror?.();

		try {
			await promise;
		} catch {
			// Expected rejection
		}

		expect( isSurvicateScriptLoaded() ).toBe( false );
	} );
} );

describe( 'resetSurvicateScriptState', () => {
	test( 'should reset the loaded state', async () => {
		const originalCreateElement = document.createElement;
		const originalGetElementsByTagName = document.getElementsByTagName;

		const mockScript = {
			src: '',
			async: false,
			onload: null as ( () => void ) | null,
			onerror: null as ( () => void ) | null,
		};
		document.createElement = jest.fn( () => mockScript as unknown as HTMLScriptElement );
		document.getElementsByTagName = jest.fn(
			() =>
				[ { parentNode: { insertBefore: jest.fn() } } ] as unknown as HTMLCollectionOf< Element >
		);

		const promise = loadSurvicateScript( 'test-id' );
		mockScript.onload?.();
		await promise;

		expect( isSurvicateScriptLoaded() ).toBe( true );

		resetSurvicateScriptState();

		expect( isSurvicateScriptLoaded() ).toBe( false );

		document.createElement = originalCreateElement;
		document.getElementsByTagName = originalGetElementsByTagName;
	} );
} );
