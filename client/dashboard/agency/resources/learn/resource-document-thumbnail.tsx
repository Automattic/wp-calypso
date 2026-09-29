import { useEffect, useRef, useState } from 'react';

// Render one document at a time and reuse previews when switching layouts.
export type DocumentThumbnailInfo = { pages: number; aspectRatio: number };
const thumbnails = new Map< string, { image: string; info: DocumentThumbnailInfo } >();
let renderQueue: Promise< void > = Promise.resolve();

export default function ResourceDocumentThumbnail( {
	url,
	onLoad,
	onError,
}: {
	url: string;
	onLoad?: ( info: DocumentThumbnailInfo ) => void;
	onError?: () => void;
} ) {
	const ref = useRef< HTMLSpanElement >( null );
	const [ image, setImage ] = useState( () => thumbnails.get( url )?.image );

	useEffect( () => {
		const element = ref.current;
		if ( ! element || thumbnails.has( url ) ) {
			setImage( thumbnails.get( url )?.image );
			const cached = thumbnails.get( url );
			if ( cached ) {
				onLoad?.( cached.info );
			}
			return;
		}
		let active = true;
		let task: ReturnType< typeof import('pdfjs-dist').getDocument > | undefined;
		const observer = new IntersectionObserver(
			( entries ) => {
				if ( ! entries.some( ( entry ) => entry.isIntersecting ) ) {
					return;
				}
				observer.disconnect();
				renderQueue = renderQueue.then( async () => {
					if ( ! active ) {
						return;
					}
					try {
						const pdf = await import( 'pdfjs-dist' );
						if ( ! active ) {
							return;
						}
						pdf.GlobalWorkerOptions.workerSrc = new URL(
							'pdfjs-dist/build/pdf.worker.min.mjs',
							import.meta.url
						).href;
						task = pdf.getDocument( { url } );
						const document = await task.promise;
						const page = await document.getPage( 1 );
						if ( ! active ) {
							return;
						}
						const base = page.getViewport( { scale: 1 } );
						const viewport = page.getViewport( { scale: 640 / base.width } );
						const canvas = window.document.createElement( 'canvas' );
						canvas.width = viewport.width;
						canvas.height = viewport.height;
						await page.render( { canvas, viewport } ).promise;
						const source = canvas.toDataURL( 'image/webp', 0.85 );
						if ( thumbnails.size >= 60 ) {
							thumbnails.delete( thumbnails.keys().next().value! );
						}
						const info = { pages: document.numPages, aspectRatio: base.width / base.height };
						thumbnails.set( url, { image: source, info } );
						if ( active ) {
							setImage( source );
							onLoad?.( info );
						}
					} catch {
						// Retain the illustrated preview if the remote document is unavailable.
						if ( active ) {
							onError?.();
						}
					} finally {
						await task?.destroy().catch( () => {} );
					}
				} );
			},
			{ rootMargin: '160px' }
		);
		observer.observe( element );
		return () => {
			active = false;
			observer.disconnect();
			void task?.destroy().catch( () => {} );
		};
	}, [ url, onLoad, onError ] );

	return (
		<span className="resource-document-thumbnail" ref={ ref }>
			{ image && <img src={ image } alt="" /> }
		</span>
	);
}
