import { formatNumber } from '@automattic/number-formatters';
import { Card, CardBody, Tooltip, VisuallyHidden } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { BuildHtmlPreview } from './html-preview';
import { useBuildImagePreview } from './use-build-image-preview';
import { ViewSwitch } from './view-switch';
import type { StreamPage, StreamTypeface } from './reducer';
import type { BuildWowStreamView } from './use-build-wow-stream';
import type { CanvasView } from './view-switch';

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

function Placeholder( { className }: { className: string } ) {
	return (
		<span aria-hidden="true" className={ `site-generation-canvas__placeholder ${ className }` } />
	);
}

// The strip stays a glanceable row; the count still covers every image.
const MAX_IMAGE_TILES = 8;
const SITE_MARK_IMAGE_ID = 'site-logo.png';
const PENDING_IMAGE_TILES = 4;

function sectionCountLabel( pages: StreamPage[] ): string | null {
	const sections = pages.reduce( ( total, page ) => total + page.sections.length, 0 );
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
	planned: number,
	sources: Record< string, string >
) {
	const entries = Object.entries( images );
	const tiles: { key: string; previewId?: string; src?: string; isMark?: boolean }[] = entries
		.filter( ( [ , image ] ) => image.status !== 'failed' )
		.map( ( [ id, image ] ) => ( {
			key: `image-${ id }`,
			previewId: image.previewId,
			src: image.status === 'ready' ? loadedImage( id, image.url, sources ) : undefined,
			isMark: id === SITE_MARK_IMAGE_ID,
		} ) );
	for ( let slot = entries.length; slot < planned; slot++ ) {
		tiles.push( { key: `slot-${ slot }` } );
	}
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
}: {
	stream: BuildWowStreamView | null;
	previewId?: string;
	src?: string;
	isMark?: boolean;
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
				<Placeholder className="site-generation-canvas__image-placeholder" />
			) }
		</li>
	);
}

function DesignBrief( {
	stream,
	isGenerating,
	imageSources,
}: {
	stream: BuildWowStreamView | null;
	isGenerating: boolean;
	imageSources: Record< string, string >;
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
	const sectionCount = sectionCountLabel( pages );
	const { tiles, ready: readyImages } = imageTiles(
		state?.images ?? {},
		plan?.images?.length ?? 0,
		imageSources
	);
	const awaitingImages = tiles.length === 0;
	const showImages = tiles.length > 0 || ( isDesignPending && hasCapability( stream, 'images' ) );
	const fontFamiliesToLoad = [
		...new Set( faces.map( ( face ) => streamedFontFamily( face.family ) ) ),
	].filter( ( family ): family is string => family !== null );

	return (
		<Card className="site-generation-canvas__brief" data-loading={ isDesignPending } size="none">
			<CardBody className="site-generation-canvas__brief-content">
				{ fontFamiliesToLoad.map( ( family ) => (
					<StreamedFont family={ family } key={ family } />
				) ) }
				<h2 className="site-generation-canvas__brief-title">
					{ plan?.title ?? __( 'Your site is taking shape' ) }
				</h2>
				{ direction && (
					<p className="site-generation-canvas__brief-direction is-revealed">{ direction }</p>
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
													<span className="site-generation-canvas__font-name">{ face.name }</span>
													{ face.role && (
														<span className="site-generation-canvas__font-role">{ face.role }</span>
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
											<li className="is-revealed" key={ page.slug }>
												{ page.title }
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
								aria-busy={ awaitingImages }
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
												<ImageTile key={ index } stream={ stream } />
											) )
										: tiles
												.slice( 0, MAX_IMAGE_TILES )
												.map( ( tile ) => (
													<ImageTile
														isMark={ tile.isMark }
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

function Canvas( {
	stream,
	reassurance,
	hostState,
	isComplete: isCompleteProp = false,
	onPreviewReady,
}: CanvasProps ) {
	const [ handedOff, setHandedOff ] = useState( false );
	const [ homeRendered, setHomeRendered ] = useState( false );
	const [ chosenView, setChosenView ] = useState< CanvasView | null >( null );
	const [ imageSources, setImageSources ] = useState< Record< string, string > >( {} );
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
	const view: CanvasView = chosenView ?? ( handedOff ? 'site' : 'design' );
	const previewReady = homeRendered && view === 'site';

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
			data-view={ view }
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
						isGenerating={ isGenerating }
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
							isActive={ view === 'site' }
							isComplete={ isComplete }
							isGenerating={ isGenerating }
							onHomeReady={ handleHomeReady }
							onImages={ setImageSources }
							stream={ stream }
						/>
					</div>
				) }
			</div>
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
