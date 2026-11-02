import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IMAGE_MIMES, preparePreviewDocument } from './html-preview-document';
import { BuildHtmlPreviewFallback } from './html-preview-fallback';
import { createPreviewFrame, isPreviewFrameStatus } from './html-preview-frame';
import { createPreviewAssetLoader } from './preview-asset-loader';
import { useBuildHtmlPreview } from './use-build-html-preview';
import type { PreparedPreviewDocument, PreviewAsset } from './html-preview-document';
import type { LoadedPreviewAsset } from './preview-asset-loader';
import type { StreamPreview } from './reducer';
import type { BuildWowStreamView } from './use-build-wow-stream';

import './html-preview.scss';

export type BuildHtmlPreviewProps = {
	stream: BuildWowStreamView;
	isActive: boolean;
	isGenerating: boolean;
	isComplete: boolean;
	isFinishing?: boolean;
	onHomeReady?: ( ready: boolean ) => void;
	onTour?: ( title: string | null ) => void;
	/** A page the user asked to see; the frame scrolls it into view. */
	focus?: { route: string; nonce: number } | null;
	/** Object URLs of the generated images the preview has loaded, by theme asset path. */
	onImages?: ( images: Record< string, string > ) => void;
};

type DocumentPacket = {
	route: string;
	epoch: string;
	title: string;
	html: string;
	revision: number;
	ready: boolean;
};

type RoutePreview = { reference: StreamPreview; title: string };

// A full runtime declines assets; each one is offered again only when capacity
// or the route roster changes, and at most this many times.
const MAX_ASSET_REJECTIONS = 3;

function DocumentLoader( {
	reference,
	title,
	stream,
	onDocument,
	onAsset,
	onFailure,
}: RoutePreview & {
	stream: BuildWowStreamView;
	onDocument: (
		reference: StreamPreview,
		title: string,
		document: PreparedPreviewDocument,
		ready: boolean
	) => void;
	onAsset: (
		reference: StreamPreview,
		source: string,
		asset: PreviewAsset,
		signal: AbortSignal
	) => void;
	onFailure: ( route: string, failed: boolean ) => void;
} ) {
	const { html, assets, failed, ready } = useBuildHtmlPreview( reference, stream );
	const assetLifetime = useRef< AbortController | null >( null );
	useEffect( () => {
		assetLifetime.current = new AbortController();
		return () => assetLifetime.current?.abort();
	}, [] );
	useEffect( () => {
		if ( html === null ) {
			return;
		}
		const document = preparePreviewDocument( html, assets );
		if ( document ) {
			onDocument( reference, title, document, ready );
		}
	}, [ html, assets, ready, reference, title, onDocument ] );
	useEffect( () => {
		if ( html === null || ! assets ) {
			return;
		}
		const controller = assetLifetime.current;
		if ( ! controller || controller.signal.aborted ) {
			return;
		}
		// Individual loads share the loader's global concurrency bound. A slow font
		// must not withhold a successful image or the document itself.
		for ( const [ source, asset ] of Object.entries( assets ) ) {
			onAsset( reference, source, asset, controller.signal );
		}
	}, [ html, assets, reference, onAsset ] );
	useEffect( () => onFailure( reference.route, failed ), [ reference.route, failed, onFailure ] );
	return null;
}

function PreviewScene( {
	stream,
	isActive,
	isGenerating,
	isComplete,
	isFinishing = false,
	onHomeReady,
	onTour,
	focus,
	onImages,
}: BuildHtmlPreviewProps ) {
	const iframe = useRef< HTMLIFrameElement >( null );
	const port = useRef< MessagePort | null >( null );
	const connected = useRef( false );
	const loader = useRef< ReturnType< typeof createPreviewAssetLoader > | null >( null );
	const documents = useRef( new Map< string, DocumentPacket >() );
	const pendingAssets = useRef( new Map< string, LoadedPreviewAsset >() );
	const sentAssets = useRef( new Set< string >() );
	const loadingAssets = useRef( new Set< string >() );
	const retryAssets = useRef( new Map< string, () => void >() );
	const rejectedAssets = useRef( new Set< string >() );
	const rejections = useRef( new Map< string, number >() );
	const rosterSignature = useRef( '' );
	const handshakeTimer = useRef< ReturnType< typeof setTimeout > | undefined >( undefined );
	const callback = useRef( onHomeReady );
	callback.current = onHomeReady;
	const tourCallback = useRef( onTour );
	tourCallback.current = onTour;
	const imagesCallback = useRef( onImages );
	imagesCallback.current = onImages;
	const imageUrls = useRef( new Map< string, string >() );
	const imageSources = useRef( new Map< string, string >() );
	const [ frame, setFrame ] = useState< ReturnType< typeof createPreviewFrame > | null >( null );
	const [ unavailable, setUnavailable ] = useState( false );
	const [ failures, setFailures ] = useState< Record< string, boolean > >( {} );
	const routes = useMemo( () => {
		const titles = new Map< string, string >();
		for ( const page of stream.state.plan?.pages ?? [] ) {
			const slug = page.slug.replace( /^\/+|\/+$/g, '' );
			if ( ! /^[\w-]+$/.test( slug ) ) {
				continue;
			}
			titles.set( slug === 'home' ? '/' : `/${ slug }/`, page.title );
		}
		return Object.values( stream.state.previews )
			.filter( ( preview ) => preview.route === '/' || titles.has( preview.route ) )
			.slice( 0, 24 )
			.sort( ( a, b ) => Number( b.route === '/' ) - Number( a.route === '/' ) )
			.map( ( reference ) => ( {
				reference,
				title: reference.route === '/' ? __( 'Homepage' ) : titles.get( reference.route )!,
			} ) );
	}, [ stream.state.previews, stream.state.plan?.pages ] );
	const references = useRef( new Map< string, StreamPreview >() );
	references.current = new Map(
		routes.map( ( route ) => [ route.reference.route, route.reference ] )
	);
	const config = useRef( {} );
	config.current = {
		active: isActive,
		generating: isGenerating,
		complete: isComplete,
		finishing: isFinishing,
		waiting: __( 'Your homepage is taking shape.' ),
		imageError: __( 'Image preview unavailable' ),
	};

	const post = useCallback(
		( type: string, data: Record< string, unknown >, transfer: Transferable[] = [] ) => {
			if ( ! frame || ! port.current || ! connected.current ) {
				return false;
			}
			try {
				port.current.postMessage( { ...data, v: 1, channel: frame.channel, type }, transfer );
				return true;
			} catch {
				setUnavailable( true );
				return false;
			}
		},
		[ frame ]
	);
	const flushAssets = useCallback( () => {
		for ( const [ id, asset ] of pendingAssets.current ) {
			if ( post( 'assets', { assets: [ asset ] }, [ asset.bytes ] ) ) {
				sentAssets.current.add( id );
				pendingAssets.current.delete( id );
			}
		}
	}, [ post ] );
	const onDocument = useCallback(
		(
			reference: StreamPreview,
			title: string,
			document: PreparedPreviewDocument,
			ready: boolean
		) => {
			if ( references.current.get( reference.route )?.epoch !== reference.epoch ) {
				return;
			}
			const old = documents.current.get( reference.route );
			if (
				old?.html === document.html &&
				old.epoch === reference.epoch &&
				old.title === title &&
				old.ready === ready
			) {
				return;
			}
			const packet: DocumentPacket = {
				route: reference.route,
				epoch: reference.epoch,
				title: title.slice( 0, 100 ),
				html: document.html,
				revision: ( old?.revision ?? 0 ) + 1,
				ready,
			};
			documents.current.set( reference.route, packet );
			post( 'render', packet );
		},
		[ post ]
	);
	// The runtime takes ownership of the bytes it is sent, so a copy is kept first.
	const captureImage = useCallback( ( source: string, loaded: LoadedPreviewAsset ) => {
		if ( ! IMAGE_MIMES.includes( loaded.mimeType ) ) {
			return;
		}
		let url = imageUrls.current.get( loaded.id );
		if ( ! url ) {
			url = URL.createObjectURL( new Blob( [ loaded.bytes ], { type: loaded.mimeType } ) );
			imageUrls.current.set( loaded.id, url );
		}
		imageSources.current.set( source, url );
		imagesCallback.current?.( Object.fromEntries( imageSources.current ) );
	}, [] );
	const onAsset = useCallback(
		( reference: StreamPreview, source: string, asset: PreviewAsset, signal: AbortSignal ) => {
			const requestKey = `${ reference.route }:${ reference.epoch }:${ asset.id }`;
			const request = () => {
				if (
					signal.aborted ||
					sentAssets.current.has( asset.id ) ||
					// A declined asset waits for a capacity or roster change, within its budget.
					rejectedAssets.current.has( asset.id ) ||
					( rejections.current.get( asset.id ) ?? 0 ) > MAX_ASSET_REJECTIONS ||
					loadingAssets.current.has( requestKey ) ||
					! loader.current
				) {
					return;
				}
				loadingAssets.current.add( requestKey );
				void loader.current
					.load( { [ source ]: asset }, signal )
					.then( ( result ) => {
						if (
							signal.aborted ||
							references.current.get( reference.route )?.epoch !== reference.epoch ||
							sentAssets.current.has( asset.id )
						) {
							return;
						}
						const loaded = result[ source ];
						if ( ! loaded ) {
							return;
						}
						captureImage( source, loaded );
						const size = Array.from( pendingAssets.current.values() ).reduce(
							( total, item ) => total + item.bytes.byteLength,
							0
						);
						if ( size + loaded.bytes.byteLength <= 32 * 1024 * 1024 ) {
							pendingAssets.current.set( loaded.id, loaded );
							flushAssets();
						}
					} )
					.finally( () => loadingAssets.current.delete( requestKey ) );
			};
			retryAssets.current.set( asset.id, request );
			request();
		},
		[ flushAssets, captureImage ]
	);
	const retryRejectedAssets = useCallback( () => {
		const ids = Array.from( rejectedAssets.current );
		rejectedAssets.current.clear();
		for ( const id of ids ) {
			if (
				Array.from( documents.current.values() ).some( ( packet ) => packet.html.includes( id ) )
			) {
				retryAssets.current.get( id )?.();
			}
		}
	}, [] );

	const onFailure = useCallback( ( route: string, failed: boolean ) => {
		setFailures( ( previous ) =>
			previous[ route ] === failed ? previous : { ...previous, [ route ]: failed }
		);
	}, [] );
	const connect = useCallback( () => {
		if ( ! frame || ! iframe.current?.contentWindow || typeof MessageChannel === 'undefined' ) {
			setUnavailable( true );
			return;
		}
		port.current?.close();
		connected.current = false;
		const connection = new MessageChannel();
		port.current = connection.port1;
		connection.port1.onmessage = ( event: MessageEvent< unknown > ) => {
			if ( ! isPreviewFrameStatus( event.data, frame.channel ) ) {
				return;
			}
			if ( event.data.type === 'rejected' ) {
				for ( const id of event.data.ids ) {
					sentAssets.current.delete( id );
					const count = ( rejections.current.get( id ) ?? 0 ) + 1;
					rejections.current.set( id, count );
					if ( count <= MAX_ASSET_REJECTIONS ) {
						rejectedAssets.current.add( id );
					}
				}
				return;
			}
			if ( event.data.type === 'evicted' ) {
				retryRejectedAssets();
				for ( const id of event.data.ids ) {
					sentAssets.current.delete( id );
					if (
						Array.from( documents.current.values() ).some( ( packet ) =>
							packet.html.includes( id )
						)
					) {
						retryAssets.current.get( id )?.();
					}
				}
				return;
			}
			if ( event.data.type === 'status' ) {
				callback.current?.( event.data.homeReady );
				return;
			}
			if ( event.data.type === 'tour' ) {
				tourCallback.current?.( event.data.title );
				return;
			}
			clearTimeout( handshakeTimer.current );
			connected.current = true;
			setUnavailable( false );
			post( 'config', config.current );
			post( 'routes', { routes: Array.from( references.current.keys() ) } );
			for ( const packet of documents.current.values() ) {
				post( 'render', packet );
			}
			flushAssets();
		};
		connection.port1.start();
		iframe.current.contentWindow.postMessage(
			{ v: 1, type: 'connect', channel: frame.channel },
			'*', // Opaque sandbox origins cannot be named by targetOrigin.
			[ connection.port2 ]
		);
		clearTimeout( handshakeTimer.current );
		handshakeTimer.current = setTimeout( () => setUnavailable( true ), 5000 );
	}, [ frame, post, flushAssets, retryRejectedAssets ] );

	useEffect( () => {
		connected.current = false;
		sentAssets.current.clear();
		pendingAssets.current.clear();
		loadingAssets.current.clear();
		rejectedAssets.current.clear();
		rejections.current.clear();
		try {
			setFrame( createPreviewFrame() );
		} catch {
			setUnavailable( true );
		}
		loader.current = createPreviewAssetLoader( stream.info.snapshotUrl );
		callback.current?.( false );
		const urls = imageUrls.current;
		const sources = imageSources.current;
		return () => {
			loader.current?.dispose();
			if ( port.current ) {
				port.current.onmessage = null;
				port.current.close();
			}
			connected.current = false;
			clearTimeout( handshakeTimer.current );
			callback.current?.( false );
			tourCallback.current?.( null );
			const hadImages = urls.size > 0;
			urls.forEach( ( url ) => URL.revokeObjectURL( url ) );
			urls.clear();
			sources.clear();
			if ( hadImages ) {
				imagesCallback.current?.( {} );
			}
		};
	}, [ stream.info.snapshotUrl ] );
	useEffect( () => {
		if ( unavailable ) {
			callback.current?.( false );
		}
	}, [ unavailable ] );
	useEffect( () => {
		post( 'config', config.current );
	}, [ isActive, isGenerating, isComplete, isFinishing, post ] );

	useEffect( () => {
		if ( focus ) {
			post( 'focus', { route: focus.route } );
		}
	}, [ focus, post ] );
	useEffect( () => {
		for ( const [ route, packet ] of documents.current ) {
			if ( references.current.get( route )?.epoch !== packet.epoch ) {
				documents.current.delete( route );
			}
		}
		const roster = Array.from( references.current.keys() );
		post( 'routes', { routes: roster } );
		const signature = [ ...roster ].sort().join( '\n' );
		if ( signature !== rosterSignature.current ) {
			rosterSignature.current = signature;
			retryRejectedAssets();
		}
	}, [ routes, post, retryRejectedAssets ] );

	return (
		<div className="site-generation-live__html-preview" aria-hidden={ ! isActive || undefined }>
			{ routes.map( ( route ) => (
				<DocumentLoader
					key={ `${ route.reference.route }:${ route.reference.epoch }` }
					{ ...route }
					stream={ stream }
					onDocument={ onDocument }
					onAsset={ onAsset }
					onFailure={ onFailure }
				/>
			) ) }
			{ frame && (
				<iframe
					ref={ iframe }
					title={ __( 'Site preview' ) }
					className="site-generation-live__preview-frame"
					sandbox="allow-scripts"
					referrerPolicy="no-referrer"
					hidden={ unavailable }
					srcDoc={ frame.srcDoc }
					onLoad={ connect }
				/>
			) }
			{ unavailable && <BuildHtmlPreviewFallback stream={ stream } /> }
			{ ( unavailable || routes.some( ( route ) => failures[ route.reference.route ] ) ) && (
				<p className="site-generation-live__preview-notice" role="status">
					{ __( 'The preview could not be updated. Your site is still being built.' ) }
				</p>
			) }
		</div>
	);
}

export function BuildHtmlPreview( props: BuildHtmlPreviewProps ) {
	const { stream } = props;
	const identity = [
		stream.info.blogId,
		stream.info.runId,
		stream.info.snapshotUrl,
		stream.state.attempt,
		stream.state.phases.prepare ?? 0,
		stream.state.phases.finish_apply ?? 0,
	].join( ':' );
	return <PreviewScene key={ identity } { ...props } />;
}
