import { __, sprintf } from '@wordpress/i18n';
import {
	getSampleFindings,
	getSampleLenses,
	getSampleSite,
	getSeverityLabel,
} from './sample-report-data';
import type { SampleFinding, SampleLens, SampleSeverity } from './sample-report-data';
import type { CSSProperties } from 'react';

/**
 * A sample report rendered as HTML pages. Every size inside a page is in `em`
 * against a font size tied to the page width (container query units), so the
 * same page renders crisply as a thumbnail or full size in the viewer.
 */

export const SAMPLE_PAGES = [
	'cover',
	'scores',
	'human',
	'ai',
	'findings-top',
	'findings-rest',
] as const;
export type SamplePageKey = ( typeof SAMPLE_PAGES )[ number ];

export function getSamplePageIndex( key: SamplePageKey ) {
	return SAMPLE_PAGES.indexOf( key );
}

function ratingFor( score: number ) {
	if ( score >= 80 ) {
		return { key: 'good', label: __( 'Strong' ) };
	}
	if ( score >= 50 ) {
		return { key: 'warn', label: __( 'Needs work' ) };
	}
	return { key: 'danger', label: __( 'At risk' ) };
}

function ratioSeverity( score: number, max: number ) {
	return ratingFor( max ? ( score / max ) * 100 : 0 ).key;
}

function PageFrame( {
	index,
	eyebrow,
	children,
}: {
	index: number;
	eyebrow?: string;
	children: React.ReactNode;
} ) {
	const site = getSampleSite();
	return (
		<div className="amplify-sample-page__inner">
			{ eyebrow && <span className="amplify-sample-page__eyebrow">{ eyebrow }</span> }
			{ children }
			<footer className="amplify-sample-page__footer">
				<span>
					{ site.name } · { site.url }
				</span>
				<span>{ index + 1 }</span>
			</footer>
		</div>
	);
}

function Bar( { score, max }: { score: number; max: number } ) {
	return (
		<span className="amplify-sample-page__bar" data-severity={ ratioSeverity( score, max ) }>
			<span style={ { '--fill': score / max } as CSSProperties } />
		</span>
	);
}

function CoverPage( { index }: { index: number } ) {
	const site = getSampleSite();
	const lenses = getSampleLenses();
	return (
		<PageFrame index={ index }>
			<div className="amplify-sample-page__cover">
				<span className="amplify-sample-page__eyebrow">{ __( 'Homepage report' ) }</span>
				<h1>{ site.name }</h1>
				<p className="amplify-sample-page__muted">
					{ site.descriptor } · { site.url }
				</p>
				<div className="amplify-sample-page__cover-scores">
					{ lenses.map( ( lens ) => {
						const rating = ratingFor( lens.score );
						return (
							<div
								key={ lens.key }
								className="amplify-sample-page__cover-score"
								data-severity={ rating.key }
							>
								<span>{ lens.label }</span>
								<strong>{ lens.score }</strong>
								<em>{ rating.label }</em>
							</div>
						);
					} ) }
				</div>
				<p>
					{ __(
						'Before a new guest books a table, the homepage has already made an impression. This report looks at the site through two lenses: how it lands with first-time visitors, and how clearly AI agents can understand and recommend it.'
					) }
				</p>
				<div className="amplify-sample-page__toc">
					<strong>{ __( 'In this report' ) }</strong>
					<ol>
						<li>{ __( 'Score breakdown' ) }</li>
						<li>{ __( 'How people judge a site, by category' ) }</li>
						<li>{ __( 'How AI interprets a site, by category' ) }</li>
						<li>{ __( 'Findings by severity' ) }</li>
					</ol>
				</div>
			</div>
			<p className="amplify-sample-page__muted amplify-sample-page__date">
				{ sprintf(
					/* translators: %s: date the report was generated */
					__( 'Audited %s · Homepage only' ),
					site.date
				) }
			</p>
		</PageFrame>
	);
}

function countBySeverity( findings: SampleFinding[] ) {
	const counts: Record< SampleSeverity, number > = { critical: 0, high: 0, medium: 0, low: 0 };
	for ( const finding of findings ) {
		counts[ finding.severity ] += 1;
	}
	return counts;
}

function ScoresPage( { index }: { index: number } ) {
	const lenses = getSampleLenses();
	const counts = countBySeverity( getSampleFindings() );
	return (
		<PageFrame index={ index } eyebrow={ __( 'Overview' ) }>
			<h2>{ __( 'Score breakdown' ) }</h2>
			<p className="amplify-sample-page__muted">
				{ __( 'How the homepage performed across every category, in both lenses.' ) }
			</p>
			{ lenses.map( ( lens ) => (
				<section key={ lens.key } className="amplify-sample-page__breakdown">
					<header>
						<strong>{ lens.title }</strong>
						<span data-severity={ ratingFor( lens.score ).key }>
							{ lens.score }/100 · { ratingFor( lens.score ).label }
						</span>
					</header>
					<ul>
						{ lens.categories.map( ( category ) => (
							<li key={ category.key }>
								<span>{ category.label }</span>
								<Bar score={ category.score } max={ category.max } />
								<b>
									{ category.score }/{ category.max }
								</b>
							</li>
						) ) }
					</ul>
				</section>
			) ) }
			<div className="amplify-sample-page__counts">
				{ ( Object.keys( counts ) as SampleSeverity[] ).map( ( severity ) => (
					<span key={ severity } data-severity={ severity }>
						<strong>{ counts[ severity ] }</strong> { getSeverityLabel( severity ) }
					</span>
				) ) }
			</div>
			<div className="amplify-sample-page__note">
				<strong>{ __( 'How to read the scores' ) }</strong>
				<p>
					{ __(
						'80 to 100 is Strong, 50 to 79 Needs work, and below 50 At risk. Scores are directional and based on the homepage only. They don’t predict rankings, traffic, or bookings.'
					) }
				</p>
			</div>
		</PageFrame>
	);
}

function CriteriaPage( { index, lens }: { index: number; lens: SampleLens } ) {
	return (
		<PageFrame index={ index } eyebrow={ lens.label }>
			<h2>{ lens.title }</h2>
			<p className="amplify-sample-page__muted">
				{ __( 'Each category, why it matters to the business, and what we found.' ) }
			</p>
			<div className="amplify-sample-page__criteria">
				{ lens.categories.map( ( category ) => (
					<section key={ category.key }>
						<header>
							<strong>{ category.label }</strong>
							<Bar score={ category.score } max={ category.max } />
							<b data-severity={ ratioSeverity( category.score, category.max ) }>
								{ category.score }/{ category.max }
							</b>
						</header>
						<p className="amplify-sample-page__why">{ category.why }</p>
						<ul>
							{ category.signals.map( ( signal ) => (
								<li key={ signal.label } data-status={ signal.status }>
									<span>{ signal.label }</span>
									<span>{ signal.note }</span>
								</li>
							) ) }
						</ul>
					</section>
				) ) }
			</div>
		</PageFrame>
	);
}

function FindingsPage( {
	index,
	severities,
	title,
}: {
	index: number;
	severities: SampleSeverity[];
	title?: string;
} ) {
	const lenses = getSampleLenses();
	const lensTitle = ( key: SampleFinding[ 'lens' ] ) =>
		lenses.find( ( lens ) => lens.key === key )?.title ?? '';
	const findings = getSampleFindings();
	return (
		<PageFrame index={ index } eyebrow={ __( 'Findings' ) }>
			{ title && (
				<>
					<h2>{ title }</h2>
					<p className="amplify-sample-page__muted">
						{ __(
							'Each finding explains why it matters and how to improve it, starting with the ones that cost the most new business.'
						) }
					</p>
				</>
			) }
			{ severities.map( ( severity ) => (
				<section
					key={ severity }
					className="amplify-sample-page__findings"
					data-severity={ severity }
				>
					<span className="amplify-sample-page__severity">{ getSeverityLabel( severity ) }</span>
					{ findings
						.filter( ( finding ) => finding.severity === severity )
						.map( ( finding ) => (
							<article key={ finding.title }>
								<span className="amplify-sample-page__finding-meta">
									{ lensTitle( finding.lens ) } · { finding.category }
								</span>
								<strong>{ finding.title }</strong>
								<p>{ finding.detail }</p>
								<p className="amplify-sample-page__impact">
									<b>{ __( 'Why it matters:' ) }</b> { finding.impact }
								</p>
								<p className="amplify-sample-page__improve">
									<b>{ __( 'How to improve:' ) }</b> { finding.improve }
								</p>
							</article>
						) ) }
				</section>
			) ) }
		</PageFrame>
	);
}

export function SampleReportPage( {
	page,
	isDecorative = false,
}: {
	page: SamplePageKey;
	isDecorative?: boolean;
} ) {
	const index = getSamplePageIndex( page );
	const lenses = getSampleLenses();
	let content: React.ReactNode;
	switch ( page ) {
		case 'cover':
			content = <CoverPage index={ index } />;
			break;
		case 'scores':
			content = <ScoresPage index={ index } />;
			break;
		case 'human':
			content = <CriteriaPage index={ index } lens={ lenses[ 0 ] } />;
			break;
		case 'ai':
			content = <CriteriaPage index={ index } lens={ lenses[ 1 ] } />;
			break;
		case 'findings-top':
			content = (
				<FindingsPage
					index={ index }
					severities={ [ 'critical', 'high' ] }
					title={ __( 'Findings by severity' ) }
				/>
			);
			break;
		default:
			content = <FindingsPage index={ index } severities={ [ 'medium', 'low' ] } />;
	}
	return (
		<div
			className="amplify-sample-page"
			data-page={ page }
			aria-hidden={ isDecorative || undefined }
		>
			{ content }
			<SampleWatermark />
		</div>
	);
}

const WATERMARK_ROWS = 14;
const WATERMARK_REPEATS = 4;

/**
 * Repeating, low-opacity label so nobody mistakes the sample for real data or
 * final report design. Visible on every page, including the landing-page tiles.
 */
function SampleWatermark() {
	const label = __( 'Sample report · Fictional data · Design in progress' );
	return (
		<div className="amplify-sample-page__watermark" aria-hidden="true">
			<div>
				{ Array.from( { length: WATERMARK_ROWS }, ( _, row ) => (
					<span key={ row } data-offset={ row % 2 === 1 || undefined }>
						{ Array( WATERMARK_REPEATS ).fill( label ).join( '   ·   ' ) }
					</span>
				) ) }
			</div>
		</div>
	);
}
