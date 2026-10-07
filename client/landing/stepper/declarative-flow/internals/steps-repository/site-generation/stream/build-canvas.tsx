import { Tabs } from '@automattic/components';
import { Icon, caution, image as imageIcon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useBuildImagePreview } from './use-build-image-preview';
import type {
	StreamImage,
	StreamPage,
	StreamPlan,
	StreamPlanImage,
	StreamSection,
} from './reducer';
import type { BuildWowStreamView } from './use-build-wow-stream';
import type { CSSProperties } from 'react';

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

function imageLabel( id: string ): string | null {
	const filename = id.split( '/' ).pop() ?? id;
	const stem = filename.replace( /\.[^.]+$/, '' );
	if ( /[a-f\d]{16,}/i.test( stem ) ) {
		return null;
	}
	const words = stem.replace( /[-_]+/g, ' ' ).replace( /\s+/g, ' ' ).trim();
	if ( ! words ) {
		return null;
	}
	return words.charAt( 0 ).toUpperCase() + words.slice( 1 );
}

function imageEntriesForPlan(
	plannedImages: StreamPlanImage[] | null | undefined,
	images: Record< string, StreamImage >
): Array< [ string, StreamImage ] > {
	const lifecycleImages = Object.entries( images );
	if ( ! plannedImages?.length ) {
		return lifecycleImages;
	}

	const matchedIds = new Set< string >();
	const plannedEntries = plannedImages.map( ( planned, index ) => {
		const match = lifecycleImages.find(
			( [ id, image ] ) => ! matchedIds.has( id ) && image.query === planned.query
		);
		if ( match ) {
			matchedIds.add( match[ 0 ] );
			return [ `planned-${ index }`, match[ 1 ] ] as [ string, StreamImage ];
		}
		return [
			`planned-${ index }`,
			{
				status: 'pending',
				url: null,
				query: planned.query,
				aspectRatio: planned.aspectRatio,
			},
		] as [ string, StreamImage ];
	} );

	return [ ...plannedEntries, ...lifecycleImages.filter( ( [ id ] ) => ! matchedIds.has( id ) ) ];
}

function ImagePreview( {
	url: fallbackUrl,
	previewId,
	stream,
	label,
	status,
	objectFit,
}: {
	url: string | null;
	previewId?: string;
	stream: BuildWowStreamView | null;
	label: string;
	status: string;
	objectFit: 'cover' | 'contain';
} ) {
	const previewUrl = useBuildImagePreview( previewId, stream );
	const url = previewUrl ?? fallbackUrl;
	const [ loadedUrl, setLoadedUrl ] = useState< string | null >( null );
	const [ failedUrl, setFailedUrl ] = useState< string | null >( null );
	const isLoaded = Boolean( url && loadedUrl === url && failedUrl !== url );
	return (
		<div className="site-generation-live__image-preview" data-loaded={ isLoaded }>
			<span aria-hidden="true" className="site-generation-live__slot-mark" data-status={ status }>
				<Icon icon={ status === 'failed' ? caution : imageIcon } />
			</span>
			{ url && failedUrl !== url && (
				<img
					alt={ label }
					loading="lazy"
					onError={ () => setFailedUrl( url ) }
					onLoad={ () => setLoadedUrl( url ) }
					referrerPolicy="no-referrer"
					src={ url }
					style={ { objectFit } }
				/>
			) }
		</div>
	);
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

function paletteColor( palette: StreamPlan[ 'palette' ], names: string[], fallback: string ) {
	const namedColor = palette?.find( ( swatch ) =>
		names.some( ( name ) => swatch.name.toLowerCase().includes( name ) )
	);
	return namedColor?.color ?? fallback;
}

type OutlineRow = {
	key: string;
	name: string;
	state: 'planned' | 'partial' | 'written';
};

function outlineRows(
	page: StreamPage,
	routeSections: Record< number, StreamSection > | undefined,
	showSectionState: boolean
): OutlineRow[] {
	const streamed = showSectionState
		? Object.entries( routeSections ?? {} )
				.map( ( [ position, section ] ) => ( { position: Number( position ), section } ) )
				.filter( ( item ) => item.section.kind === 'content' && item.section.name )
				.sort( ( a, b ) => a.position - b.position )
		: [];
	const used = new Set< string >();
	const rows: OutlineRow[] = page.sections.map( ( name, index ) => {
		const match = streamed.find( ( item ) => item.section.name === name );
		if ( match?.section.name ) {
			used.add( match.section.name );
		}
		let state: OutlineRow[ 'state' ] = 'planned';
		if ( match?.section.partial ) {
			state = 'partial';
		} else if ( match ) {
			state = 'written';
		}
		return {
			key: `${ page.slug }-${ index }-${ name }`,
			name,
			state,
		};
	} );

	for ( const item of streamed ) {
		const name = item.section.name;
		if ( ! name || used.has( name ) ) {
			continue;
		}
		rows.push( {
			key: `${ page.slug }-live-${ item.position }-${ name }`,
			name,
			state: item.section.partial ? 'partial' : 'written',
		} );
	}

	return rows;
}

/** A live, read-only canvas built only from data this graph has streamed. */
export function BuildWowStreamCanvas( {
	stream,
	activityLabel,
	reassurance,
	imageBaseUrl,
}: {
	stream: BuildWowStreamView | null;
	activityLabel?: string;
	reassurance?: string;
	imageBaseUrl?: string;
} ) {
	const translate = useTranslate();
	const state = stream?.state;
	const plan = state?.plan;
	// Older Build Wow hosts may advertise only `progress` while still forwarding
	// the Engine's structured plan fields. Render those fields when present; the
	// payload itself is the evidence, and this UI never renders generated markup.
	const canPlan =
		hasCapability( stream, 'planning' ) ||
		Boolean( plan?.direction || plan?.pages || plan?.images?.length );
	const canDesign =
		hasCapability( stream, 'design' ) ||
		Boolean( plan?.palette?.length || plan?.typography?.length );
	const canShowSections = hasCapability( stream, 'sections' );
	const directions = canPlan ? ( state?.directions ?? [] ) : [];
	const palette = canDesign ? ( plan?.palette ?? [] ) : [];
	const typography = canDesign ? ( plan?.typography ?? [] ) : [];
	const pages = canPlan ? ( plan?.pages ?? [] ) : [];
	const imageEntries = imageEntriesForPlan( plan?.images, state?.images ?? {} );
	const readyImages = imageEntries.filter( ( [ , image ] ) => image.status === 'ready' ).length;
	const headingFace =
		typography.find( ( face ) => isHeadingRole( face.role ) ) ?? typography[ 0 ] ?? null;
	const bodyFace =
		typography.find( ( face ) => face !== headingFace && isBodyRole( face.role ) ) ??
		typography.find( ( face ) => face !== headingFace ) ??
		null;
	const fontFamiliesToLoad = [
		...new Set( typography.map( ( face ) => streamedFontFamily( face.family ) ) ),
	].filter( ( family ): family is string => family !== null );
	const paletteStyle = {
		'--live-site-accent': paletteColor( palette, [ 'accent', 'primary', 'highlight' ], '#3858e9' ),
		'--live-site-surface': paletteColor( palette, [ 'surface', 'paper', 'background' ], '#f6f6f7' ),
	} as CSSProperties;
	const groups = pages.map( ( page ) => ( {
		key: page.slug,
		title: page.title,
		rows: outlineRows( page, state?.sections[ page.slug ], canShowSections ),
	} ) );

	if ( canShowSections ) {
		for ( const [ route, positions ] of Object.entries( state?.sections ?? {} ) ) {
			if ( pages.some( ( page ) => page.slug === route ) ) {
				continue;
			}
			const rows = outlineRows( { slug: route, title: route, sections: [] }, positions, true );
			if ( rows.length > 0 ) {
				groups.push( { key: route, title: route, rows } );
			}
		}
	}

	const rowCount = groups.reduce( ( total, group ) => total + group.rows.length, 0 );
	const isComposing = groups.some( ( group ) =>
		group.rows.some( ( row ) => row.state === 'partial' )
	);
	const hasBrief = Boolean(
		plan?.title ||
		plan?.direction ||
		directions.length ||
		palette.length ||
		typography.length ||
		pages.length ||
		plan?.images?.length
	);
	let lede: string | null = null;
	if ( plan?.direction && canPlan ) {
		lede = plan.direction;
	} else if ( directions.length === 0 ) {
		lede = String(
			translate( 'A visual world. A thoughtful structure. A site that feels like you.' )
		);
	}
	const currentStep =
		state?.currentStep ?? activityLabel ?? translate( 'Preparing your live site preview' );
	let statusLabel = translate( 'Listening' );
	if ( isComposing ) {
		statusLabel = translate( 'Composing' );
	} else if ( plan?.status === 'completed' ) {
		statusLabel = translate( 'Direction set' );
	} else if ( hasBrief ) {
		statusLabel = translate( 'Taking shape' );
	}
	const sectionCountLabel =
		rowCount === 1
			? translate( '%(count)d section', { args: { count: rowCount } } )
			: translate( '%(count)d sections', { args: { count: rowCount } } );
	const [ selectedPageKey, setSelectedPageKey ] = useState< string | null >( null );
	const selectedPageIndex = Math.max(
		0,
		groups.findIndex( ( group ) => group.key === selectedPageKey )
	);
	const selectedPage = groups[ selectedPageIndex ];

	return (
		<section
			aria-label={ String( translate( 'Live site build' ) ) }
			className="site-generation-live"
			data-brief={ hasBrief ? 'ready' : 'waiting' }
			data-capability-design={ canDesign }
			data-capability-planning={ canPlan }
			data-status={ isComposing ? 'composing' : ( plan?.status ?? 'listening' ) }
			style={ paletteStyle }
		>
			{ fontFamiliesToLoad.map( ( family ) => (
				<StreamedFont family={ family } key={ family } />
			) ) }
			<div className="site-generation-live__mast">
				<p className="site-generation-live__eyebrow">
					{ hasBrief
						? translate( 'The creative direction' )
						: translate( 'Your idea, taking shape' ) }
				</p>
				<p className="site-generation-live__status">
					<span aria-hidden="true" className="site-generation-live__status-dot" />
					<span>{ statusLabel }</span>
				</p>
			</div>

			<div className="site-generation-live__stage">
				<div className="site-generation-live__direction">
					<h2
						className="site-generation-live__title"
						key={ plan?.title ?? 'site-title-placeholder' }
						style={
							headingFace
								? ( {
										fontFamily: specimenStack( headingFace.family, 'var(--live-serif)' ),
									} as CSSProperties )
								: undefined
						}
					>
						{ plan?.title ?? translate( 'Your site is taking shape' ) }
					</h2>
					{ lede && (
						<p className="site-generation-live__lede" key={ lede }>
							{ lede }
						</p>
					) }

					{ typography.length > 0 && headingFace ? (
						<div
							className="site-generation-live__specimen"
							key={ `${ headingFace.family }-${ bodyFace?.family ?? '' }` }
						>
							<p className="site-generation-live__label">{ translate( 'The type' ) }</p>
							<div className="site-generation-live__specimen-sample">
								<span
									aria-hidden="true"
									className="site-generation-live__specimen-display"
									style={ {
										fontFamily: specimenStack( headingFace.family, 'var(--live-serif)' ),
									} }
								>
									Aa
								</span>
								{ bodyFace && (
									<span
										className="site-generation-live__specimen-body"
										style={ {
											fontFamily: specimenStack( bodyFace.family, 'var(--live-sans)' ),
										} }
									>
										{ translate( 'The feeling of this place' ) }
									</span>
								) }
							</div>
							<ul className="site-generation-live__faces">
								{ typography.map( ( face ) => (
									<li key={ `${ face.role ?? 'type' }-${ face.family }` }>
										{ face.role && (
											<span className="site-generation-live__face-role">{ face.role }</span>
										) }
										<span className="site-generation-live__face-name">{ face.name }</span>
									</li>
								) ) }
							</ul>
						</div>
					) : null }

					{ ( directions.length > 0 || ! plan?.direction ) && (
						<div className="site-generation-live__feeling">
							<p className="site-generation-live__label">{ translate( 'The feeling' ) }</p>
							{ directions.length > 0 ? (
								<ul className="site-generation-live__chips">
									{ directions.map( ( direction ) => (
										<li className="site-generation-live__chip" key={ direction }>
											{ direction }
										</li>
									) ) }
								</ul>
							) : (
								<>
									<p className="site-generation-live__waiting-line">
										{ translate( 'Finding your point of view…' ) }
									</p>
									<p className="site-generation-live__waiting-note">
										{ translate( 'Exploring color, type, and character' ) }
									</p>
								</>
							) }
						</div>
					) }

					{ palette.length > 0 && (
						<div
							className="site-generation-live__palette-block"
							key={ palette.map( ( swatch ) => swatch.color ).join( '-' ) }
						>
							<p className="site-generation-live__label">{ translate( 'The palette' ) }</p>
							<ul
								aria-label={ String( translate( 'Emerging color palette' ) ) }
								className="site-generation-live__palette"
							>
								{ palette.map( ( swatch ) => (
									<li
										aria-label={ `${ swatch.name }, ${ swatch.color }` }
										className="site-generation-live__swatch"
										key={ `${ swatch.name }-${ swatch.color }` }
									>
										<span
											aria-hidden="true"
											className="site-generation-live__swatch-chip"
											style={ { backgroundColor: swatch.color } }
										/>
										<span className="site-generation-live__swatch-name">{ swatch.name }</span>
										<span className="site-generation-live__swatch-hex">{ swatch.color }</span>
									</li>
								) ) }
							</ul>
						</div>
					) }

					{ imageEntries.length > 0 && (
						<div className="site-generation-live__imagery">
							<div className="site-generation-live__label-row">
								<p className="site-generation-live__label">{ translate( 'The imagery' ) }</p>
								<p className="site-generation-live__image-count">
									{ translate( '%(ready)d of %(total)d images ready', {
										args: { ready: readyImages, total: imageEntries.length },
									} ) }
								</p>
							</div>
							<ul className="site-generation-live__slots">
								{ imageEntries.map( ( [ key, image ] ) => {
									const previewUrl =
										image.url && imageBaseUrl ? new URL( image.url, imageBaseUrl ).href : null;
									const queryLabel =
										image.query && /^[a-z\d]+(?:[-_][a-z\d]+)+$/i.test( image.query )
											? imageLabel( image.query )
											: image.query;
									const label =
										queryLabel ?? imageLabel( key ) ?? String( translate( 'Site image' ) );
									return (
										<li
											className={ `site-generation-live__slot site-generation-live__slot--${ image.status }` }
											key={ key }
										>
											<ImagePreview
												label={ label }
												previewId={ image.previewId }
												stream={ stream }
												objectFit={ image.aspectRatio === '1:1' ? 'contain' : 'cover' }
												status={ image.status }
												url={ previewUrl }
											/>
											<span className="site-generation-live__slot-name">{ label }</span>
											<span className="site-generation-live__slot-status">
												{ image.status === 'ready' && translate( 'Ready' ) }
												{ image.status === 'generating' && translate( 'Creating' ) }
												{ image.status === 'failed' && translate( 'Generation attempt failed' ) }
												{ image.status === 'pending' && translate( 'Waiting' ) }
											</span>
										</li>
									);
								} ) }
							</ul>
							{ imageEntries.some(
								( [ , image ] ) => image.status === 'ready' && ! image.url && ! image.previewId
							) && (
								<p className="site-generation-live__waiting-note">
									{ translate( 'Images are ready. Previews aren’t available for this build.' ) }
								</p>
							) }
						</div>
					) }
				</div>

				<div className="site-generation-live__structure">
					<div className="site-generation-live__structure-head">
						<p className="site-generation-live__label">{ translate( 'The structure' ) }</p>
						<p className="site-generation-live__structure-note">
							{ rowCount > 0 ? sectionCountLabel : translate( 'Listening to your brief' ) }
						</p>
					</div>
					<div className="site-generation-live__site">
						<span
							aria-hidden={ plan?.title ? true : undefined }
							className="site-generation-live__site-name"
						>
							{ plan?.title ?? translate( 'Your new website' ) }
						</span>
					</div>
					{ selectedPage ? (
						<Tabs
							onSelect={ ( key: string | null | undefined ) => setSelectedPageKey( key ?? null ) }
							selectedTabId={ selectedPage.key }
						>
							<Tabs.TabList
								aria-label={ String( translate( 'Site pages' ) ) }
								className="site-generation-live__page-tabs"
								density="compact"
							>
								{ groups.map( ( group ) => (
									<Tabs.Tab key={ group.key } tabId={ group.key }>
										{ group.title }
									</Tabs.Tab>
								) ) }
							</Tabs.TabList>
							{ groups.map( ( group ) => (
								<Tabs.TabPanel
									className="site-generation-live__pages"
									key={ group.key }
									tabId={ group.key }
								>
									<ol className="site-generation-live__rows">
										{ group.rows.map( ( row, index ) => (
											<li
												className="site-generation-live__row"
												data-state={ row.state }
												key={ row.key }
											>
												<span aria-hidden="true" className="site-generation-live__row-index">
													{ String( index + 1 ).padStart( 2, '0' ) }
												</span>
												<span className="site-generation-live__row-name">{ row.name }</span>
												{ row.state === 'partial' && (
													<span className="site-generation-live__row-state">
														{ translate( 'In progress' ) }
													</span>
												) }
												{ row.state === 'written' && (
													<span className="site-generation-live__row-state">
														{ translate( 'Added' ) }
													</span>
												) }
											</li>
										) ) }
									</ol>
								</Tabs.TabPanel>
							) ) }
						</Tabs>
					) : (
						<div className="site-generation-live__outline-empty">
							<p>{ translate( 'Connecting your ideas into a site' ) }</p>
							<p className="site-generation-live__waiting-note">
								{ translate( 'Your page structure will appear here' ) }
							</p>
						</div>
					) }
					{ hasBrief && (
						<p className="site-generation-live__sketch">
							{ translate( 'A first sketch. Refined as we create.' ) }
						</p>
					) }
				</div>
			</div>

			<div aria-live="polite" className="site-generation-live__activity" role="status">
				<span className="site-generation-live__activity-copy">
					<span>{ currentStep }</span>
					{ reassurance && <span className="site-generation-live__reassure">{ reassurance }</span> }
				</span>
			</div>
		</section>
	);
}
