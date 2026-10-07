/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react';
import { initialStreamState } from '../stream/reducer';
import { useBuildImagePreview } from '../stream/use-build-image-preview';
import type { BuildWowStreamView } from '../stream/use-build-wow-stream';

const previewId = 'a'.repeat( 64 );
const dataUrl = 'data:image/png;base64,aGVsbG8=';
const stream: BuildWowStreamView = {
	info: {
		protocol: 1,
		blogId: 123,
		runId: 'current-run',
		capabilities: [ 'images' ],
		eventsUrl: 'https://public-api.wordpress.com/wpcom/v2/sites/123/big-sky/build-wow/events',
		snapshotUrl: 'https://public-api.wordpress.com/wpcom/v2/sites/123/big-sky/build-wow/snapshot',
	},
	state: initialStreamState( 'current-run' ),
	authorize: async () => 'Bearer site-token',
};

const originalFetch = global.fetch;
afterEach( () => {
	global.fetch = originalFetch;
} );

it( 'loads an authenticated run-scoped image without cookies or redirects', async () => {
	const fetchPreview = jest.fn().mockResolvedValue( {
		ok: true,
		json: async () => ( { data_url: dataUrl } ),
	} );
	global.fetch = fetchPreview;
	const { result } = renderHook( () => useBuildImagePreview( previewId, stream ) );
	await waitFor( () => expect( result.current ).toBe( dataUrl ) );
	expect( fetchPreview ).toHaveBeenCalledWith(
		`https://public-api.wordpress.com/wpcom/v2/sites/123/big-sky/build-wow/image?run_id=current-run&preview_id=${ previewId }`,
		expect.objectContaining( {
			headers: { Authorization: 'Bearer site-token' },
			credentials: 'omit',
			redirect: 'error',
		} )
	);
} );

it( 'drops the previous preview immediately when the run changes', async () => {
	global.fetch = jest.fn().mockResolvedValue( {
		ok: true,
		json: async () => ( { data_url: dataUrl } ),
	} );
	const { result, rerender } = renderHook(
		( { value } ) => useBuildImagePreview( previewId, value ),
		{
			initialProps: { value: stream },
		}
	);
	await waitFor( () => expect( result.current ).toBe( dataUrl ) );
	global.fetch = jest.fn().mockReturnValue( new Promise( () => {} ) );
	rerender( { value: { ...stream, info: { ...stream.info, runId: 'new-run' } } } );
	expect( result.current ).toBeNull();
} );

it( 'never accepts active documents or external URLs as image bytes', async () => {
	global.fetch = jest.fn().mockResolvedValue( {
		ok: true,
		json: async () => ( { data_url: 'data:text/html;base64,aGVsbG8=' } ),
	} );
	const { result } = renderHook( () => useBuildImagePreview( previewId, stream ) );
	await waitFor( () => expect( global.fetch ).toHaveBeenCalled() );
	expect( result.current ).toBeNull();
} );
