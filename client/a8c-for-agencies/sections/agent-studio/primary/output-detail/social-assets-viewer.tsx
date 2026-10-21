import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	useEffect,
	useMemo,
	useRef,
	useState,
	type MutableRefObject,
	type PointerEvent,
	type RefObject,
} from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useDownloadSocialPng from '../../data/use-download-social-png';
import { HtmlRenderPreview } from '../../social-design/components/HtmlRenderPreview';
import { captureFittedTileHtml } from '../../social-design/services/captureFittedHtml';
import { prepareBeaRenderElement } from '../../social-design/services/renderBeaPng';
import type { AgentStudioSocialAsset } from '../../types';

import './social-assets-viewer.scss';

interface Props {
	assets: AgentStudioSocialAsset[];
	title: string;
	postId: number;
}

type SocialChannelKey = AgentStudioSocialAsset[ 'sizeKey' ];
type SocialCanvasItem = AgentStudioSocialAsset & { channel: SocialChannelKey };
type SocialCanvasEntry = { item: SocialCanvasItem; index: number };

const CHANNEL_LABEL: Record< SocialChannelKey, string > = {
	cover: __( 'Cover' ),
	email: __( 'Email' ),
	square: __( 'Square' ),
	story: __( 'Story' ),
};

function safeFileBase( title: string, label: string ): string {
	return `${ title }-${ label }`
		.normalize( 'NFKD' )
		.replace( /[^a-zA-Z0-9-_ ]+/g, '' )
		.trim()
		.replace( /\s+/g, '-' )
		.toLowerCase();
}

function interleaveAssets( assets: AgentStudioSocialAsset[] ): SocialCanvasItem[] {
	const byChannel: Record< SocialChannelKey, AgentStudioSocialAsset[] > = {
		cover: [],
		email: [],
		square: [],
		story: [],
	};

	assets.forEach( ( asset ) => {
		byChannel[ asset.sizeKey ].push( asset );
	} );

	const order: SocialChannelKey[] = [ 'cover', 'story', 'square', 'email' ];
	const queues = order.map( ( key ) =>
		byChannel[ key ].map( ( asset ) => ( { ...asset, channel: key } ) )
	);
	const output: SocialCanvasItem[] = [];
	let cursor = 0;
	let drained = false;

	while ( ! drained ) {
		drained = true;
		queues.forEach( ( queue ) => {
			const next = queue[ cursor ];
			if ( next ) {
				output.push( next );
				drained = false;
			}
		} );
		cursor += 1;
	}

	return output;
}

function distributeIntoColumns(
	items: SocialCanvasItem[],
	columnCount: number
): SocialCanvasEntry[][] {
	const columns: SocialCanvasEntry[][] = Array.from( { length: columnCount }, () => [] );
	const heights = new Array( columnCount ).fill( 0 );
	const tieTolerance = 0.55;

	items.forEach( ( item, index ) => {
		const unit = item.height / item.width + 0.2;
		const minHeight = Math.min( ...heights );
		const candidates: number[] = [];

		for ( let i = 0; i < columnCount; i += 1 ) {
			if ( heights[ i ] <= minHeight + tieTolerance ) {
				candidates.push( i );
			}
		}

		const varied = candidates.find( ( i ) => {
			const column = columns[ i ];
			return column.length === 0 || column[ column.length - 1 ].item.channel !== item.channel;
		} );
		const target = varied ?? candidates[ 0 ];
		columns[ target ].push( { item, index } );
		heights[ target ] += unit;
	} );

	return columns;
}

export default function SocialAssetsViewer( { assets, title, postId }: Props ) {
	const canvasRef = useRef< HTMLDivElement >( null );
	const dragRef = useRef( {
		active: false,
		moved: false,
		startX: 0,
		startY: 0,
		scrollLeft: 0,
		scrollTop: 0,
	} );
	const [ viewportWidth, setViewportWidth ] = useState( () =>
		typeof window === 'undefined' ? 1440 : window.innerWidth
	);

	const items = useMemo( () => interleaveAssets( assets ), [ assets ] );
	const columnCount = useMemo( () => {
		const byWidth = Math.max( 5, Math.round( viewportWidth / 200 ) );
		return Math.max( 3, Math.min( byWidth, Math.ceil( items.length / 2 ) ) );
	}, [ viewportWidth, items.length ] );
	const columns = useMemo(
		() => distributeIntoColumns( items, columnCount ),
		[ items, columnCount ]
	);

	useEffect( () => {
		const handleResize = () => setViewportWidth( window.innerWidth );
		window.addEventListener( 'resize', handleResize );
		return () => window.removeEventListener( 'resize', handleResize );
	}, [] );

	function handleCanvasPointerDown( event: PointerEvent< HTMLDivElement > ) {
		// Reset the moved guard at the start of every gesture, including
		// when we early-return on a button/link target. Otherwise a
		// previous pan leaves dragRef.current.moved=true and the next
		// click on a tile's PNG button is silently swallowed by the
		// guard in downloadAsset.
		dragRef.current.moved = false;
		if ( event.button !== 0 || ( event.target as HTMLElement ).closest( 'button, a' ) ) {
			return;
		}
		const canvas = canvasRef.current;
		if ( ! canvas ) {
			return;
		}
		event.preventDefault();
		// Do not pause rendering on pan — tiles should keep filling in as the
		// user drags around the canvas.
		dragRef.current = {
			active: true,
			moved: false,
			startX: event.clientX,
			startY: event.clientY,
			scrollLeft: canvas.scrollLeft,
			scrollTop: canvas.scrollTop,
		};
		canvas.setPointerCapture( event.pointerId );
		canvas.classList.add( 'is-panning' );
	}

	function handleCanvasPointerMove( event: PointerEvent< HTMLDivElement > ) {
		const drag = dragRef.current;
		const canvas = canvasRef.current;
		if ( ! drag.active || ! canvas ) {
			return;
		}
		const dx = event.clientX - drag.startX;
		const dy = event.clientY - drag.startY;
		if ( ! drag.moved && Math.hypot( dx, dy ) > 4 ) {
			drag.moved = true;
		}
		canvas.scrollLeft = drag.scrollLeft - dx;
		canvas.scrollTop = drag.scrollTop - dy;
		event.preventDefault();
	}

	function endCanvasPan( event: PointerEvent< HTMLDivElement > ) {
		const canvas = canvasRef.current;
		dragRef.current.active = false;
		canvas?.classList.remove( 'is-panning' );
		if ( canvas?.hasPointerCapture( event.pointerId ) ) {
			canvas.releasePointerCapture( event.pointerId );
		}
	}

	if ( ! assets.length ) {
		return (
			<VStack className="a4a-agent-studio-output-detail__state" alignment="center" spacing={ 3 }>
				<Text>{ __( 'No social assets are available for this deliverable yet.' ) }</Text>
			</VStack>
		);
	}

	return (
		<div
			ref={ canvasRef }
			className="a4a-agent-studio-social-assets"
			onPointerDown={ handleCanvasPointerDown }
			onPointerMove={ handleCanvasPointerMove }
			onPointerUp={ endCanvasPan }
			onPointerCancel={ endCanvasPan }
			onPointerLeave={ endCanvasPan }
		>
			<div className="a4a-agent-studio-social-assets__canvas">
				{ columns.map( ( column, columnIdx ) => (
					<div className="a4a-agent-studio-social-assets__col" key={ `col-${ columnIdx }` }>
						{ column.map( ( { item, index } ) => (
							<SocialAssetTile
								key={ `${ item.id }-${ index }` }
								asset={ item }
								index={ index }
								title={ title }
								postId={ postId }
								dragRef={ dragRef }
								rootRef={ canvasRef }
							/>
						) ) }
					</div>
				) ) }
			</div>
		</div>
	);
}

function triggerBlobDownload( blob: Blob, fileName: string ) {
	const objectUrl = URL.createObjectURL( blob );
	try {
		const link = document.createElement( 'a' );
		link.href = objectUrl;
		link.download = fileName;
		link.rel = 'noopener';
		document.body.appendChild( link );
		link.click();
		link.remove();
	} finally {
		// Revoking immediately after click() is safe; the browser has
		// already kicked off the save by the time we return.
		URL.revokeObjectURL( objectUrl );
	}
}

function SocialAssetTile( {
	asset,
	dragRef,
	index,
	postId,
	rootRef,
	title,
}: {
	asset: SocialCanvasItem;
	dragRef: MutableRefObject< { moved: boolean } >;
	index: number;
	postId: number;
	rootRef: RefObject< HTMLDivElement | null >;
	title: string;
} ) {
	const [ downloading, setDownloading ] = useState( false );
	const label = asset.groupLabel ?? `Direction ${ index + 1 }`;
	const frameRef = useRef< HTMLDivElement >( null );
	const [ nearViewport, setNearViewport ] = useState( false );
	const downloadPng = useDownloadSocialPng();
	const dispatch = useDispatch();

	useEffect( () => {
		if ( ! asset.html ) {
			return;
		}
		const element = frameRef.current;
		if ( ! element ) {
			return;
		}
		const observer = new IntersectionObserver(
			( entries ) => {
				if ( entries.some( ( entry ) => entry.isIntersecting ) ) {
					setNearViewport( true );
					observer.disconnect();
				}
			},
			{ root: rootRef.current ?? null, rootMargin: '700px' }
		);
		observer.observe( element );
		return () => observer.disconnect();
	}, [ asset.html, rootRef ] );

	const downloadAsset = async () => {
		if ( downloading || dragRef.current.moved ) {
			return;
		}

		setDownloading( true );
		try {
			// Run the in-document fitting pipeline offscreen, then ship
			// the post-fit static HTML to the wpcom render endpoint.
			// The server proxies to Browserless and streams the PNG
			// bytes back inline — nothing is persisted, the user saves
			// the returned Blob directly.
			const fittedHtml = await captureFittedTileHtml( asset.html, {
				width: asset.width,
				height: asset.height,
			} );
			const blob = await downloadPng( {
				postId,
				directionId: asset.directionId,
				size: asset.sizeKey,
				html: fittedHtml,
				width: asset.width,
				height: asset.height,
			} );
			triggerBlobDownload(
				blob,
				`${ safeFileBase( title, `${ asset.label }-${ index + 1 }` ) || 'social-asset' }.png`
			);
			dispatch(
				recordTracksEvent( 'calypso_a4a_agent_studio_social_png_downloaded', {
					output_id: postId,
					direction_id: asset.directionId,
					size: asset.sizeKey,
				} )
			);
		} finally {
			setDownloading( false );
		}
	};

	return (
		<figure className="a4a-agent-studio-social-assets__tile">
			<div
				ref={ frameRef }
				className="a4a-agent-studio-social-assets__tile-frame"
				style={ { aspectRatio: `${ asset.width } / ${ asset.height }` } }
			>
				{ nearViewport && asset.html ? (
					<HtmlRenderPreview
						html={ asset.html }
						size={ { width: asset.width, height: asset.height, label: asset.label } }
						className="a4a-agent-studio-social-assets__html"
						ariaLabel={ `${ CHANNEL_LABEL[ asset.channel ] } · ${ label }` }
						prepareContent={ prepareBeaRenderElement }
					/>
				) : (
					<div className="a4a-agent-studio-social-assets__ghost" aria-hidden="true" />
				) }
				<button
					type="button"
					className="a4a-agent-studio-social-assets__download"
					onClick={ () => void downloadAsset() }
					disabled={ downloading || ! asset.html }
				>
					{ downloading ? __( 'Building…' ) : __( 'PNG' ) }
				</button>
			</div>
			<figcaption className="a4a-agent-studio-social-assets__caption">
				<span className="a4a-agent-studio-social-assets__format">
					{ CHANNEL_LABEL[ asset.channel ] }
				</span>
				<span className="a4a-agent-studio-social-assets__name">{ label }</span>
			</figcaption>
		</figure>
	);
}
