import { useEffect, useState } from 'react';
import { MAX_PREVIEW_HTML_BYTES } from './html-preview-document';
import type { StreamPreview } from './reducer';
import type { BuildWowStreamView } from './use-build-wow-stream';

export function useBuildHtmlPreview(
	reference: StreamPreview | undefined,
	stream: BuildWowStreamView | null
) {
	const [ loaded, setLoaded ] = useState< { key: string; html: string } | null >( null );
	const [ failedKey, setFailedKey ] = useState< string | null >( null );
	const previewUrl = stream?.info.previewUrl;
	const runId = stream?.info.runId;
	const blogId = stream?.info.blogId;
	const authorize = stream?.authorize;
	const route = reference?.route;
	const epoch = reference?.epoch;
	const documentId = reference?.documentId;
	const key = `${ blogId }:${ runId }:${ epoch }:${ route }`;

	useEffect( () => {
		if ( ! previewUrl || ! runId || ! route || ! epoch || ! documentId || ! authorize ) {
			return;
		}
		const controller = new AbortController();
		let timer: ReturnType< typeof setTimeout > | undefined;
		let failures = 0;
		setFailedKey( null );
		const load = async () => {
			try {
				const authorization = await authorize();
				if ( controller.signal.aborted ) {
					return;
				}
				if ( ! authorization ) {
					throw new Error( 'Preview authentication unavailable' );
				}
				const url = new URL( previewUrl );
				url.search = new URLSearchParams( { run_id: runId, route } ).toString();
				const response = await fetch( url.href, {
					headers: { Authorization: authorization },
					credentials: 'omit',
					redirect: 'error',
					signal: controller.signal,
				} );
				if ( ! response.ok ) {
					throw new Error( 'Preview unavailable' );
				}
				const body = await response.json();
				if (
					body?.v !== 1 ||
					body.run_id !== runId ||
					body.route !== route ||
					body.epoch !== epoch ||
					body.format !== 'dsl-html' ||
					typeof body.html !== 'string' ||
					new Blob( [ body.html ] ).size > MAX_PREVIEW_HTML_BYTES
				) {
					throw new Error( 'Invalid preview document' );
				}
				if ( ! controller.signal.aborted ) {
					setLoaded( { key, html: body.html } );
				}
			} catch {
				if ( controller.signal.aborted ) {
					return;
				}
				if ( failures < 3 ) {
					timer = setTimeout( load, 1000 * 2 ** failures++ );
				} else {
					setFailedKey( key );
				}
			}
		};
		void load();
		return () => {
			controller.abort();
			clearTimeout( timer );
		};
	}, [ previewUrl, runId, route, epoch, documentId, authorize, key ] );

	return {
		html: reference && loaded?.key === key ? loaded.html : null,
		failed: failedKey === key,
	};
}
