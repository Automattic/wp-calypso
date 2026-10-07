import { useTranslate } from 'i18n-calypso';
import type { StreamPage, StreamSection } from './reducer';
import type { BuildWowStreamView } from './use-build-wow-stream';
import type { CSSProperties } from 'react';

function hasCapability( stream: BuildWowStreamView, capability: string ): boolean {
	return stream.info.capabilities.includes( capability );
}

// Streamed family names become a font-family stack. Anything that is not a
// real family name is dropped, and a local face always follows so a missing
// webfont still leaves the specimen readable.
function specimenStack( family: string, fallback: string ): string {
	const safe = family.replace( /[^a-zA-Z0-9 -]/g, '' ).trim();
	return safe ? `"${ safe }", ${ fallback }` : fallback;
}

function isHeadingRole( role: string | null ): boolean {
	return /heading|display|title|headline/i.test( role ?? '' );
}

function isBodyRole( role: string | null ): boolean {
	return /body|text|paragraph/i.test( role ?? '' );
}

function imageLabel( id: string ): string {
	const words = id.replace( /[-_]+/g, ' ' ).replace( /\s+/g, ' ' ).trim();
	if ( ! words ) {
		return id;
	}
	return words.charAt( 0 ).toUpperCase() + words.slice( 1 );
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
}: {
	stream: BuildWowStreamView;
	activityLabel?: string;
	reassurance?: string;
} ) {
	const translate = useTranslate();
	const { info, state } = stream;
	const plan = state.plan;
	// Older Build Wow hosts may advertise only `progress` while still forwarding
	// the Engine's structured plan fields. Render those fields when present; the
	// payload itself is the evidence, and this UI never renders generated markup.
	const canPlan = hasCapability( stream, 'planning' ) || Boolean( plan?.direction || plan?.pages );
	const canDesign =
		hasCapability( stream, 'design' ) ||
		Boolean( plan?.palette?.length || plan?.typography?.length );
	const canShowSections = hasCapability( stream, 'sections' );
	const directions = canPlan ? state.directions : [];
	const palette = canDesign ? ( plan?.palette ?? [] ) : [];
	const typography = canDesign ? ( plan?.typography ?? [] ) : [];
	const pages = canPlan ? ( plan?.pages ?? [] ) : [];
	const imageEntries = Object.entries( state.images );
	const readyImages = imageEntries.filter( ( [ , status ] ) => status === 'ready' ).length;
	const headingFace =
		typography.find( ( face ) => isHeadingRole( face.role ) ) ?? typography[ 0 ] ?? null;
	const bodyFace =
		typography.find( ( face ) => face !== headingFace && isBodyRole( face.role ) ) ??
		typography.find( ( face ) => face !== headingFace ) ??
		null;
	const groups = pages.map( ( page ) => ( {
		key: page.slug,
		title: page.title,
		rows: outlineRows( page, state.sections[ page.slug ], canShowSections ),
	} ) );

	if ( canShowSections ) {
		for ( const [ route, positions ] of Object.entries( state.sections ) ) {
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
		pages.length
	);
	let lede: string | null = null;
	if ( plan?.direction && canPlan ) {
		lede = plan.direction;
	} else if ( directions.length === 0 ) {
		lede = String(
			translate( 'A visual world. A thoughtful structure. A site that feels like you.' )
		);
	}
	const currentStep = state.currentStep ?? activityLabel ?? translate( 'Getting the build ready' );
	const graphLabel = info.graph
		? translate( '%(graph)s build', { args: { graph: info.graph } } )
		: translate( 'Site build' );
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

	return (
		<section
			aria-label={ String( translate( 'Live site build' ) ) }
			className="site-generation-live"
			data-brief={ hasBrief ? 'ready' : 'waiting' }
			data-capability-design={ canDesign }
			data-capability-planning={ canPlan }
		>
			<div className="site-generation-live__mast">
				<p className="site-generation-live__eyebrow">
					{ hasBrief
						? translate( 'The creative direction' )
						: translate( 'Your idea, taking shape' ) }
				</p>
				<p className="site-generation-live__status">
					<span aria-hidden="true" className="site-generation-live__status-dot" />
					<span>{ statusLabel }</span>
					<span className="site-generation-live__graph">{ graphLabel }</span>
				</p>
			</div>

			<div className="site-generation-live__stage">
				<div className="site-generation-live__direction">
					<h2
						className="site-generation-live__title"
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
					{ lede && <p className="site-generation-live__lede">{ lede }</p> }

					{ typography.length > 0 && headingFace ? (
						<div className="site-generation-live__specimen">
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
										<span className="site-generation-live__face-name">{ face.family }</span>
									</li>
								) ) }
							</ul>
						</div>
					) : (
						<div aria-hidden="true" className="site-generation-live__cards">
							<span className="site-generation-live__card">Aa</span>
							<span className="site-generation-live__card">Aa</span>
						</div>
					) }

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
						<div className="site-generation-live__palette-block">
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
								{ imageEntries.map( ( [ id, status ] ) => (
									<li
										className={ `site-generation-live__slot site-generation-live__slot--${ status }` }
										key={ id }
									>
										<span aria-hidden="true" className="site-generation-live__slot-mark" />
										<span className="site-generation-live__slot-name">{ imageLabel( id ) }</span>
										<span className="site-generation-live__slot-status">
											{ status === 'ready' && translate( 'Ready' ) }
											{ status === 'generating' && translate( 'Creating' ) }
											{ status === 'failed' && translate( 'Couldn’t create' ) }
											{ status === 'pending' && translate( 'Waiting' ) }
										</span>
									</li>
								) ) }
							</ul>
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
						<span aria-hidden="true" className="site-generation-live__site-mark" />
						<span
							aria-hidden={ plan?.title ? true : undefined }
							className="site-generation-live__site-name"
						>
							{ plan?.title ?? translate( 'Your new website' ) }
						</span>
						<span aria-hidden="true" className="site-generation-live__status-dot" />
					</div>
					{ rowCount > 0 ? (
						<div className="site-generation-live__pages">
							{ groups.map( ( group ) => (
								<div className="site-generation-live__page" key={ group.key }>
									{ groups.length > 1 && (
										<p className="site-generation-live__page-title">{ group.title }</p>
									) }
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
								</div>
							) ) }
						</div>
					) : (
						<div className="site-generation-live__outline-empty">
							<div aria-hidden="true" className="site-generation-live__dashes">
								<span />
								<span />
								<span />
							</div>
							<p>{ translate( 'Connecting your ideas into a site' ) }</p>
							<p className="site-generation-live__waiting-note">
								{ translate( 'Your structure will appear here' ) }
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
				<span aria-hidden="true" className="site-generation-live__activity-mark" />
				<span className="site-generation-live__activity-copy">
					<span>{ currentStep }</span>
					{ reassurance && <span className="site-generation-live__reassure">{ reassurance }</span> }
				</span>
			</div>
		</section>
	);
}
