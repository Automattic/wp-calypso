import { useEffect, useState } from 'react';
import type { BuildWowStreamView } from './use-build-wow-stream';

const PREVIEW_DATA_URL = /^data:image\/(png|webp|jpeg|gif|svg\+xml);base64,[A-Za-z0-9+/]+={0,2}$/;

/** Preview bytes travel through the same site-scoped authentication as the feed. */
export function useBuildImagePreview(
	previewId: string | undefined,
	stream: BuildWowStreamView | null
) {
	const [ preview, setPreview ] = useState< { key: string; url: string } | null >( null );
	const snapshotUrl = stream?.info.snapshotUrl;
	const runId = stream?.info.runId;
	const authorize = stream?.authorize;
	const key = `${ runId }:${ previewId }`;

	useEffect( () => {
		if ( ! previewId || ! snapshotUrl || ! runId || ! authorize ) {
			return;
		}
		const controller = new AbortController();
		const load = async () => {
			try {
				const authorization = await authorize();
				if ( ! authorization || controller.signal.aborted ) {
					return;
				}
				const url = new URL( snapshotUrl );
				url.pathname = url.pathname.replace( /\/snapshot$/, '/image' );
				url.search = new URLSearchParams( { run_id: runId, preview_id: previewId } ).toString();
				const response = await fetch( url.href, {
					headers: { Authorization: authorization },
					credentials: 'omit',
					redirect: 'error',
					signal: controller.signal,
				} );
				if ( ! response.ok ) {
					return;
				}
				const body = await response.json();
				const dataUrl = body?.data_url;
				if (
					! controller.signal.aborted &&
					typeof dataUrl === 'string' &&
					dataUrl.length <= 131200 &&
					PREVIEW_DATA_URL.test( dataUrl )
				) {
					setPreview( { key, url: dataUrl } );
				}
			} catch {
				// The live board remains usable when an expiring thumbnail is unavailable.
			}
		};
		void load();
		return () => controller.abort();
	}, [ previewId, snapshotUrl, runId, authorize, key ] );

	return preview?.key === key ? preview.url : null;
}
