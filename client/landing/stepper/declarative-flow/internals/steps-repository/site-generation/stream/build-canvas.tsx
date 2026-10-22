import { formatNumber } from '@automattic/number-formatters';
import { Card, CardBody, Icon, Tooltip, VisuallyHidden } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { BuildHtmlPreview } from './html-preview';
import { useBuildImagePreview } from './use-build-image-preview';
import { ViewSwitch } from './view-switch';
import type {
	StreamImage,
	StreamPage,
	StreamPlanImage,
	StreamSwatch,
	StreamTypeface,
} from './reducer';
import type { BuildWowStreamView } from './use-build-wow-stream';
import type { CanvasView } from './view-switch';
import type { CSSProperties } from 'react';

import './build-canvas.scss';

// Host states in which the build may still add content to the preview.
const GENERATING_HOST_STATES = [ 'queued', 'generating' ];

function hasCapability( stream: BuildWowStreamView | null, capability: string ): boolean {
	return stream?.info.capabilities.includes( capability ) ?? false;
}

const GENERIC_FONT_FAMILY =
	/^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-serif|ui-sans-serif|ui-monospace|ui-rounded|emoji|math|fangsong)$/i;

function fontFamilies( family: string ): string[] {
	return family
		.split( ',' )
		.map( ( name ) => name.replace( /[^a-zA-Z0-9 -]/g, '' ).trim() )
		.filter( Boolean );
}

function specimenStack( family: string, fallback: string ): string {
	const stack = fontFamilies( family ).map( ( name ) =>
		GENERIC_FONT_FAMILY.test( name ) ? name : `"${ name }"`
	);
	return [ ...stack, fallback ].join( ', ' );
}

function isHeadingRole( role: string | null ): boolean {
	return /heading|display|title|headline/i.test( role ?? '' );
}

function isBodyRole( role: string | null ): boolean {
	return /body|text|paragraph/i.test( role ?? '' );
}

function streamedFontFamily( family: string ): string | null {
	return (
		fontFamilies( family ).find(
			( name ) => ! GENERIC_FONT_FAMILY.test( name ) && name.toLowerCase() !== 'recoleta'
		) ?? null
	);
}

function StreamedFont( { family }: { family: string } ) {
	useEffect( () => {
		const params = new URLSearchParams( {
			family: `${ family }:ital,wght@0,400;0,700;1,400;1,700`,
			display: 'swap',
		} );
		const stylesheet = document.createElement( 'link' );
		stylesheet.rel = 'stylesheet';
		stylesheet.href = `https://fonts-api.wp.com/css2?${ params.toString() }`;
		document.head.appendChild( stylesheet );
		return () => stylesheet.remove();
	}, [ family ] );
	return null;
}

function orderedFaces( typography: StreamTypeface[] ): StreamTypeface[] {
	const heading = typography.find( ( face ) => isHeadingRole( face.role ) ) ?? typography[ 0 ];
	const body =
		typography.find( ( face ) => face !== heading && isBodyRole( face.role ) ) ??
		typography.find( ( face ) => face !== heading );
	return [ heading, body ].filter( ( face ): face is StreamTypeface => Boolean( face ) );
}

function fontLabel( face: StreamTypeface ): string {
	const family = streamedFontFamily( face.family );
	const nameIsRole = face.role !== null && face.name.toLowerCase() === face.role.toLowerCase();
	return nameIsRole && family ? family : face.name;
}

function fontRole( face: StreamTypeface, label: string ): string | null {
	return face.role && face.role.toLowerCase() !== label.toLowerCase() ? face.role : null;
}

// Section events name their page by route; the plan names it by slug. The
// front page may come as '/', '' or 'index'.
function normalizeRoute( route: string ): string {
	const trimmed = route
		.trim()
		.replace( /^\/+|\/+$/g, '' )
		.toLowerCase();
	return trimmed === '' || trimmed === 'index' ? 'home' : trimmed;
}

type PageProgress = 'pending' | 'building' | 'done';

// A page counts as started once the host has rendered any preview of it, and
// as done once that preview is final or every planned section has landed.
function pageProgress(
	pages: StreamPage[],
	sections: BuildWowStreamView[ 'state' ][ 'sections' ],
	previews: BuildWowStreamView[ 'state' ][ 'previews' ] = {},
	isComplete = false,
	isBuilding = false
): { built: number; planned: number; byPage: Record< string, PageProgress > } {
	const routes = Object.entries( sections ).map( ( [ route, items ] ) => ( {
		route: normalizeRoute( route ),
		items: Object.values( items ),
	} ) );
	const rendered = Object.values( previews ).map( ( preview ) => ( {
		route: normalizeRoute( preview.route ),
		ready: preview.ready,
	} ) );
	let built = 0;
	let planned = 0;
	const byPage: Record< string, PageProgress > = {};
	for ( const page of pages ) {
		const slug = normalizeRoute( page.slug );
		const items = routes.find( ( entry ) => entry.route === slug )?.items ?? [];
		const pageBuilt = items.filter( ( item ) => ! item.partial ).length;
		const hasPartial = items.some( ( item ) => item.partial );
		const preview = rendered.find( ( entry ) => entry.route === slug );
		planned += page.sections.length;
		built += pageBuilt;
		if (
			isComplete ||
			preview?.ready ||
			( page.sections.length > 0 && pageBuilt >= page.sections.length )
		) {
			byPage[ page.slug ] = 'done';
		} else if ( preview || pageBuilt > 0 || hasPartial || isBuilding ) {
			byPage[ page.slug ] = 'building';
		} else {
			byPage[ page.slug ] = 'pending';
		}
	}
	return { built, planned, byPage };
}

// The palette names its roles; the primary (or accent) colour tints the few
// accents on the canvas so the brief reads as the site's own, not the form's.
function brandColor( palette: StreamSwatch[] ): string | null {
	const swatch =
		palette.find( ( item ) => /primary/i.test( item.name ) ) ??
		palette.find( ( item ) => /accent/i.test( item.name ) );
	return swatch?.color ?? null;
}

function Placeholder( { className }: { className: string } ) {
	return (
		<span aria-hidden="true" className={ `site-generation-canvas__placeholder ${ className }` } />
	);
}

// A planned image may be named by a file-style slug rather than a sentence;
// read it as words, without the site name repeated in front.
function imageCaption( query: string, siteTitle: string | null ): string {
	if ( /\s/.test( query ) ) {
		return query;
	}
	const words = query
		.replace( /\.[a-z0-9]+$/i, '' )
		.split( /[-_]+/ )
		.filter( Boolean );
	const prefix = ( siteTitle ?? '' )
		.toLowerCase()
		.split( /[^\p{L}\p{N}]+/u )
		.filter( Boolean );
	let shared = 0;
	while (
		shared < prefix.length &&
		shared < words.length - 1 &&
		prefix[ shared ] === words[ shared ].toLowerCase()
	) {
		shared++;
	}
	return words.slice( shared ).join( ' ' );
}

// The strip stays a glanceable row; the count still covers every image.
const MAX_IMAGE_TILES = 8;
const PENDING_IMAGE_TILES = 4;
const SITE_MARK_IMAGE_ID = 'site-logo.png';

function sectionCountLabel( pages: StreamPage[], built = 0 ): string | null {
	const sections = pages.reduce( ( total, page ) => total + page.sections.length, 0 );
	if ( built > 0 && built < sections ) {
		return sprintf(
			/* translators: 1: number of sections built so far, 2: number of sections planned. */
			_n( '%1$s of %2$s section built', '%1$s of %2$s sections built', sections ),
			formatNumber( built ),
			formatNumber( sections )
		);
	}
	return sections > 0
		? sprintf(
				/* translators: %s: number of sections planned across the site's pages. */
				_n( '%s section', '%s sections', sections ),
				formatNumber( sections )
			)
		: null;
}

// The preview registers each generated image under its theme asset path; the
// image event names the file, and may carry that path.
function loadedImage(
	id: string,
	url: string | null,
	sources: Record< string, string >
): string | undefined {
	if ( url && sources[ url ] ) {
		return sources[ url ];
	}
	const match = Object.keys( sources ).find(
		( source ) => source.split( '?' )[ 0 ].split( '/' ).pop() === id
	);
	return match ? sources[ match ] : undefined;
}

// Failed images drop out rather than leave a broken tile, and planned images
// that have not reported yet hold their place.
function imageTiles(
	images: BuildWowStreamView[ 'state' ][ 'images' ],
	plannedImages: StreamPlanImage[],
	sources: Record< string, string >,
	siteTitle: string | null
) {
	const plannedQueries = plannedImages.map( ( image ) => imageCaption( image.query, siteTitle ) );
	const tileCaption = ( id: string, image: StreamImage ) => {
		if ( id === SITE_MARK_IMAGE_ID ) {
			return __( 'Logo' );
		}
		return image.query ? imageCaption( image.query, siteTitle ) : undefined;
	};
	const entries = Object.entries( images );
	const tiles: {
		key: string;
		previewId?: string;
		src?: string;
		isMark?: boolean;
		isGenerating?: boolean;
		caption?: string;
		isSettled?: boolean;
	}[] = entries.map( ( [ id, image ] ) => ( {
		key: `image-${ id }`,
		previewId: image.previewId,
		src: image.status === 'ready' ? loadedImage( id, image.url, sources ) : undefined,
		isMark: id === SITE_MARK_IMAGE_ID,
		isGenerating: image.status === 'generating',
		isSettled: image.status === 'failed',
		caption: tileCaption( id, image ),
	} ) );
	// Pending tiles carry the planned subjects nobody has reported yet; when the
	// reports don't name their subjects, the slots fill in plan order instead.
	const remaining = [ ...plannedQueries ];
	let matched = 0;
	for ( const [ , image ] of entries ) {
		const index = image.query ? remaining.indexOf( imageCaption( image.query, siteTitle ) ) : -1;
		if ( index >= 0 ) {
			remaining.splice( index, 1 );
			matched++;
		}
	}
	const pendingCaptions =
		matched > 0 || entries.length === 0 ? remaining : plannedQueries.slice( entries.length );
	pendingCaptions.forEach( ( caption, slot ) => {
		tiles.push( { key: `slot-${ slot }`, caption } );
	} );
	return {
		tiles,
		ready: entries.filter( ( [ , image ] ) => image.status === 'ready' ).length,
	};
}

function ImageTile( {
	stream,
	previewId,
	src,
	isMark = false,
	isGenerating = false,
	isSettled = false,
	caption,
}: {
	stream: BuildWowStreamView | null;
	previewId?: string;
	src?: string;
	isMark?: boolean;
	isGenerating?: boolean;
	isSettled?: boolean;
	caption?: string;
} ) {
	const thumbnail = useBuildImagePreview( src ? undefined : previewId, stream );
	const picture = src ?? thumbnail;
	return (
		<li className="site-generation-canvas__image">
			{ picture ? (
				<img
					alt=""
					className={ clsx( 'site-generation-canvas__image-picture is-revealed', {
						'is-mark': isMark,
					} ) }
					src={ picture }
				/>
			) : (
				<span
					className={ clsx( 'site-generation-canvas__image-pending', {
						'is-generating': isGenerating,
						'is-settled': isSettled,
					} ) }
				>
					<Placeholder className="site-generation-canvas__image-placeholder" />
					{ caption && <span className="site-generation-canvas__image-caption">{ caption }</span> }
				</span>
			) }
		</li>
	);
}

function DesignBrief( {
	stream,
	isGenerating,
	isFinishing,
	isComplete,
	imageSources,
	onJump,
}: {
	stream: BuildWowStreamView | null;
	isGenerating: boolean;
	isFinishing: boolean;
	isComplete: boolean;
	imageSources: Record< string, string >;
	onJump?: ( slug: string ) => void;
} ) {
	const state = stream?.state;
	const plan = state?.plan;
	const canPlan =
		hasCapability( stream, 'planning' ) ||
		Boolean( plan?.direction || plan?.pages || plan?.images?.length );
	const canDesign =
		hasCapability( stream, 'design' ) ||
		Boolean( plan?.palette?.length || plan?.typography?.length );
	const directions = canPlan ? ( state?.directions ?? [] ) : [];
	const palette = canDesign ? ( plan?.palette ?? [] ) : [];
	const faces = orderedFaces( canDesign ? ( plan?.typography ?? [] ) : [] );
	const direction = canPlan ? plan?.direction : null;
	// A replacement proposal can clear fields before the next design arrives.
	const isDesignPending = isGenerating && plan?.status !== 'completed';
	const awaitingDirection = isDesignPending && ! direction && directions.length === 0;
	const awaitingType = isDesignPending && faces.length === 0;
	const awaitingPalette = isDesignPending && palette.length === 0;
	const showType = faces.length > 0 || awaitingType;
	const showPalette = palette.length > 0 || awaitingPalette;
	const pages = canPlan ? ( plan?.pages ?? [] ) : [];
	const awaitingPages = canPlan && isDesignPending && pages.length === 0;
	const showPages = pages.length > 0 || awaitingPages;
	// The Engine starts composing the pages the moment the plan is complete,
	// a few seconds before the first preview comes back.
	const progress = pageProgress(
		pages,
		state?.sections ?? {},
		state?.previews ?? {},
		isComplete,
		isGenerating && plan?.status === 'completed'
	);
	const sectionCount = sectionCountLabel( pages, progress.built );
	const { tiles, ready: readyImages } = imageTiles(
		state?.images ?? {},
		plan?.images ?? [],
		imageSources,
		plan?.title ?? null
	);
	// A plan can decide on no photos at all; the block then keeps its shape,
	// slots held still, instead of vanishing after they breathed through the
	// design step.
	const plannedNone = plan?.status === 'completed' && ( plan.images?.length ?? 0 ) === 0;
	const awaitingImages = tiles.length === 0 || plannedNone;
	const showImages =
		tiles.length > 0 || ( hasCapability( stream, 'images' ) && ( isDesignPending || plannedNone ) );
	const fontFamiliesToLoad = [
		...new Set( faces.map( ( face ) => streamedFontFamily( face.family ) ) ),
	].filter( ( family ): family is string => family !== null );

	return (
		<Card
			className="site-generation-canvas__brief"
			data-finishing={ isFinishing }
			data-loading={ isDesignPending }
			size="none"
		>
			<CardBody className="site-generation-canvas__brief-content">
				{ fontFamiliesToLoad.map( ( family ) => (
					<StreamedFont family={ family } key={ family } />
				) ) }
				<h2
					className={ clsx( 'site-generation-canvas__brief-title', {
						'is-branded': faces.length > 0,
					} ) }
					style={
						faces[ 0 ] ? { fontFamily: specimenStack( faces[ 0 ].family, 'serif' ) } : undefined
					}
				>
					{ plan?.title ?? __( 'Your site is taking shape' ) }
				</h2>
				{ direction && (
					<p
						className="site-generation-canvas__brief-direction is-revealed"
						style={
							faces[ 1 ]
								? { fontFamily: specimenStack( faces[ 1 ].family, 'sans-serif' ) }
								: undefined
						}
					>
						{ direction }
					</p>
				) }
				{ ! direction && directions.length > 0 && (
					<ul className="site-generation-canvas__brief-chips">
						{ directions.map( ( item ) => (
							<li key={ item }>{ item }</li>
						) ) }
					</ul>
				) }
				{ awaitingDirection && (
					<div className="site-generation-canvas__brief-direction">
						<Placeholder className="site-generation-canvas__placeholder-line" />
						<Placeholder className="site-generation-canvas__placeholder-line is-short" />
					</div>
				) }
				{ ( showType || showPalette || showPages || showImages ) && (
					<div className="site-generation-canvas__brief-grid">
						{ showType && (
							<div className="site-generation-canvas__brief-block" aria-busy={ awaitingType }>
								<h3 className="site-generation-canvas__brief-label">{ __( 'Typography' ) }</h3>
								<ul className="site-generation-canvas__fonts">
									{ faces.length > 0
										? faces.map( ( face, index ) => (
												<li
													className="site-generation-canvas__font is-revealed"
													key={ `${ index }-${ face.family }` }
												>
													<span
														aria-hidden="true"
														className="site-generation-canvas__font-specimen"
														style={ {
															fontFamily: specimenStack(
																face.family,
																index === 0 ? 'serif' : 'sans-serif'
															),
														} }
													>
														Aa
													</span>
													<span className="site-generation-canvas__font-name">
														{ fontLabel( face ) }
													</span>
													{ fontRole( face, fontLabel( face ) ) && (
														<span className="site-generation-canvas__font-role">
															{ fontRole( face, fontLabel( face ) ) }
														</span>
													) }
												</li>
											) )
										: [ 0, 1 ].map( ( index ) => (
												<li
													aria-hidden="true"
													className="site-generation-canvas__font"
													key={ index }
												>
													<Placeholder className="site-generation-canvas__placeholder-specimen" />
													<Placeholder className="site-generation-canvas__placeholder-line" />
													<Placeholder className="site-generation-canvas__placeholder-line is-short" />
												</li>
											) ) }
								</ul>
							</div>
						) }
						{ showPalette && (
							<div className="site-generation-canvas__brief-block" aria-busy={ awaitingPalette }>
								<h3 className="site-generation-canvas__brief-label">{ __( 'Palette' ) }</h3>
								<ul className="site-generation-canvas__palette">
									{ palette.length > 0
										? palette.map( ( swatch ) => (
												<li
													className="site-generation-canvas__swatch is-revealed"
													key={ `${ swatch.name }-${ swatch.color }` }
												>
													<Tooltip delay={ 200 } text={ `${ swatch.name } · ${ swatch.color }` }>
														<span
															aria-hidden="true"
															className="site-generation-canvas__swatch-chip"
															style={ { backgroundColor: swatch.color } }
														/>
													</Tooltip>
													<VisuallyHidden>{ `${ swatch.name }, ${ swatch.color }` }</VisuallyHidden>
												</li>
											) )
										: [ 0, 1, 2, 3, 4 ].map( ( index ) => (
												<li
													aria-hidden="true"
													className="site-generation-canvas__swatch"
													key={ index }
												>
													<Placeholder className="site-generation-canvas__swatch-chip" />
												</li>
											) ) }
								</ul>
							</div>
						) }
						{ showPages && (
							<div
								className="site-generation-canvas__brief-block site-generation-canvas__pages"
								aria-busy={ awaitingPages }
							>
								<div className="site-generation-canvas__brief-heading">
									<h3 className="site-generation-canvas__brief-label">{ __( 'Pages' ) }</h3>
									{ sectionCount && (
										<span className="site-generation-canvas__brief-meta">{ sectionCount }</span>
									) }
								</div>
								{ pages.length > 0 ? (
									<ul className="site-generation-canvas__brief-chips site-generation-canvas__page-list">
										{ pages.map( ( page ) => (
											<li
												className="is-revealed"
												data-progress={ progress.byPage[ page.slug ] }
												key={ page.slug }
											>
												{ onJump ? (
													<button
														aria-label={ sprintf(
															/* translators: %s: the title of a page of the site being built. */
															__( 'Show the %s page' ),
															page.title
														) }
														className="site-generation-canvas__page-jump"
														onClick={ () => onJump( page.slug ) }
														type="button"
													>
														<span>{ page.title }</span>
													</button>
												) : (
													<span>{ page.title }</span>
												) }
											</li>
										) ) }
									</ul>
								) : (
									<div aria-hidden="true">
										<Placeholder className="site-generation-canvas__placeholder-line" />
										<Placeholder className="site-generation-canvas__placeholder-line is-short" />
									</div>
								) }
							</div>
						) }
						{ showImages && (
							<div
								className="site-generation-canvas__brief-block site-generation-canvas__images"
								aria-busy={ awaitingImages && ! plannedNone }
							>
								<div className="site-generation-canvas__brief-heading">
									<h3 className="site-generation-canvas__brief-label">{ __( 'Images' ) }</h3>
									{ ! awaitingImages && (
										<span className="site-generation-canvas__brief-meta">
											{ sprintf(
												/* translators: 1: number of images ready, 2: total number of images. */
												__( '%1$s of %2$s ready' ),
												formatNumber( readyImages ),
												formatNumber( tiles.length )
											) }
										</span>
									) }
								</div>
								<ul aria-hidden="true" className="site-generation-canvas__image-strip">
									{ awaitingImages
										? Array.from( { length: PENDING_IMAGE_TILES }, ( _, index ) => (
												<ImageTile isSettled={ plannedNone } key={ index } stream={ stream } />
											) )
										: tiles
												.slice( 0, MAX_IMAGE_TILES )
												.map( ( tile ) => (
													<ImageTile
														caption={ tile.caption }
														isGenerating={ tile.isGenerating }
														isMark={ tile.isMark }
														isSettled={ tile.isSettled }
														key={ tile.key }
														previewId={ tile.previewId }
														src={ tile.src }
														stream={ stream }
													/>
												) ) }
								</ul>
							</div>
						) }
					</div>
				) }
			</CardBody>
		</Card>
	);
}

type CanvasProps = {
	stream: BuildWowStreamView | null;
	activityLabel?: string;
	reassurance?: string;
	imageBaseUrl?: string;
	hostState?: string;
	isComplete?: boolean;
	onPreviewReady?: ( ready: boolean ) => void;
};

function previewEpoch( stream: BuildWowStreamView | null ): string | null {
	const previews = stream?.state.previews ?? {};
	return previews[ '/' ]?.epoch ?? Object.values( previews )[ 0 ]?.epoch ?? null;
}

function imagesSettled( stream: BuildWowStreamView | null ): boolean {
	const planned = stream?.state.plan?.images?.length ?? 0;
	// The site mark is drawn alongside the plan's images but is not one of them.
	const images = Object.entries( stream?.state.images ?? {} )
		.filter( ( [ id ] ) => id !== SITE_MARK_IMAGE_ID )
		.map( ( [ , image ] ) => image );
	return (
		planned > 0 &&
		images.length >= planned &&
		images.every( ( image ) => image.status === 'ready' || image.status === 'failed' )
	);
}

function Canvas( {
	stream,
	activityLabel,
	reassurance,
	hostState,
	isComplete: isCompleteProp = false,
	onPreviewReady,
}: CanvasProps ) {
	const [ handedOff, setHandedOff ] = useState( false );
	const [ homeRendered, setHomeRendered ] = useState( false );
	const [ chosenView, setChosenView ] = useState< CanvasView | null >( null );
	const [ imageSources, setImageSources ] = useState< Record< string, string > >( {} );
	const [ tourTitle, setTourTitle ] = useState< string | null >( null );
	const [ focus, setFocus ] = useState< { route: string; nonce: number } | null >( null );
	const epoch = previewEpoch( stream );
	const [ seenEpoch, setSeenEpoch ] = useState( epoch );
	if ( epoch !== null && epoch !== seenEpoch ) {
		// A later epoch starts a new build and restores the design brief.
		if ( seenEpoch !== null ) {
			setHandedOff( false );
			setHomeRendered( false );
			setChosenView( null );
		}
		setSeenEpoch( epoch );
	}

	const engineTerminal = stream?.state.engineTerminal ?? null;
	const isComplete = isCompleteProp || hostState === 'ready';
	const engineStopped = engineTerminal === 'failed' || engineTerminal === 'paused';
	const isGenerating =
		! isComplete &&
		engineTerminal === null &&
		( hostState === undefined || GENERATING_HOST_STATES.includes( hostState ) );
	const canPreview = Boolean(
		stream?.info.previewUrl && hasCapability( stream, 'preview:dsl-html' )
	);
	// Once the Engine is done or the brief has nothing left to fill in, the host
	// still polishes and checks the site. The card carries that step so the wait
	// never looks stalled.
	const isFinishing =
		! isComplete &&
		! engineStopped &&
		stream?.state.plan?.status === 'completed' &&
		( engineTerminal === 'completed' || hostState === 'finishing' || imagesSettled( stream ) );
	const view: CanvasView = chosenView ?? ( handedOff ? 'site' : 'design' );
	const previewReady = homeRendered && view === 'site';

	const previews = stream?.state.previews;
	const handleJump = useCallback(
		( slug: string ) => {
			const route = Object.keys( previews ?? {} ).find(
				( candidate ) => normalizeRoute( candidate ) === normalizeRoute( slug )
			);
			if ( ! route ) {
				return;
			}
			setChosenView( 'site' );
			setFocus( { route, nonce: Date.now() } );
		},
		[ previews ]
	);
	const brand = brandColor( stream?.state.plan?.palette ?? [] );

	const handleHomeReady = useCallback(
		( ready: boolean ) => {
			setHomeRendered( ready );
			if ( ready && ! handedOff ) {
				setHandedOff( true );
			}
		},
		[ handedOff ]
	);

	useEffect( () => {
		onPreviewReady?.( previewReady );
	}, [ onPreviewReady, previewReady ] );

	return (
		<section
			aria-label={ __( 'Live site build' ) }
			className="site-generation-canvas"
			data-finishing={ isFinishing }
			data-view={ view }
			style={ { '--site-generation-brand': brand ?? undefined } as CSSProperties }
		>
			{ engineStopped && (
				<p className="site-generation-canvas__status" role="status">
					{ __( 'The preview stopped updating.' ) }
				</p>
			) }

			{ handedOff && canPreview && <ViewSwitch onChange={ setChosenView } view={ view } /> }

			<div className="site-generation-canvas__body">
				<div
					className="site-generation-canvas__design"
					aria-hidden={ view !== 'design' }
					inert={ view !== 'design' }
				>
					<DesignBrief
						imageSources={ imageSources }
						isComplete={ isComplete }
						isFinishing={ isFinishing }
						isGenerating={ isGenerating }
						onJump={ canPreview && handedOff ? handleJump : undefined }
						stream={ stream }
					/>
					{ reassurance && <p className="site-generation-canvas__reassurance">{ reassurance }</p> }
				</div>
				{ stream && canPreview && (
					<div
						className="site-generation-canvas__site"
						aria-hidden={ view !== 'site' }
						inert={ view !== 'site' }
					>
						<BuildHtmlPreview
							focus={ focus }
							isActive={ view === 'site' }
							isComplete={ isComplete }
							isFinishing={ isFinishing }
							isGenerating={ isGenerating }
							onHomeReady={ handleHomeReady }
							onImages={ setImageSources }
							onTour={ setTourTitle }
							stream={ stream }
						/>
					</div>
				) }
			</div>
			{ /* The sidebar already announces each step; only the ready beat is new
			   to assistive tech, and its region waits here so the change is read. */ }
			<VisuallyHidden>
				<span role="status">{ isComplete ? __( 'Your site is ready' ) : null }</span>
			</VisuallyHidden>
			{ ( isFinishing || isComplete ) && (
				<p
					aria-hidden="true"
					className="site-generation-canvas__status-line"
					data-complete={ isComplete }
				>
					{ isComplete ? (
						<Icon className="site-generation-canvas__status-check" icon={ check } size={ 16 } />
					) : (
						<span className="site-generation-canvas__status-activity" />
					) }
					{ isComplete
						? __( 'Your site is ready' )
						: [ activityLabel ?? __( 'Finishing up' ), tourTitle ].filter( Boolean ).join( ' · ' ) }
				</p>
			) }
		</section>
	);
}

/**
 * The live preview inside the site generation step: a compact design brief
 * that hands off once to the assembling homepage. The host owns the progress
 * checklist; this canvas only shows what the stream has delivered.
 */
export function BuildWowStreamCanvas( props: CanvasProps ) {
	const { stream } = props;
	const identity = stream ? `${ stream.info.runId }:${ stream.state.attempt }` : 'waiting';
	return <Canvas key={ identity } { ...props } />;
}
