import { __ } from '@wordpress/i18n';
import { SAMPLE_REPORT_URL } from '../sample-report-pages';
import { getPerspectives } from '../score-preview';
import { severityFor } from '../score-severity';

import './report-pages.scss';

function SamplePageHeader() {
	return (
		<div className="dashboard-amplify-story__page-header">
			<span>
				AUTOMATTIC
				<br />
				FOR AGENCIES
			</span>
			<span>oliveandember.example</span>
		</div>
	);
}

function SampleRing( { value }: { value: number } ) {
	return (
		<svg className="dashboard-amplify-story__page-ring" viewBox="0 0 36 36" focusable="false">
			<circle cx="18" cy="18" r="15.9" pathLength="100" />
			<circle cx="18" cy="18" r="15.9" pathLength="100" strokeDasharray={ `${ value } 100` } />
			<text x="18" y="22.5" textAnchor="middle">
				{ value }
				<tspan>%</tspan>
			</text>
		</svg>
	);
}

/** The sample report's first pages, rebuilt in HTML and fanned out; opens the full sample. */
export default function ReportPagesGraphic( { onOpen }: { onOpen: () => void } ) {
	const perspectives = getPerspectives();
	return (
		<a
			className="dashboard-amplify-story__pages"
			href={ SAMPLE_REPORT_URL }
			target="_blank"
			rel="noopener noreferrer"
			onClick={ onOpen }
			aria-label={ __( 'View a sample report (opens in a new tab)' ) }
		>
			<div className="dashboard-amplify-story__page" data-page="cover" aria-hidden="true">
				<div className="dashboard-amplify-story__page-cover">
					<span className="dashboard-amplify-story__page-logo">
						AUTOMATTIC
						<br />
						FOR AGENCIES
					</span>
					<span className="dashboard-amplify-story__page-site">Olive &amp; Ember</span>
					<span className="dashboard-amplify-story__page-title">
						{ __( 'A closer look at your homepage' ) }
					</span>
					<span className="dashboard-amplify-story__page-lede">
						{ __(
							'A detailed look at what you can improve for first-time visitors and AI systems.'
						) }
					</span>
				</div>
				<svg className="dashboard-amplify-story__page-art" viewBox="0 0 1000 545" focusable="false">
					<path d="M85 272Q273 75 461 272Q273 469 85 272Z" />
					<circle cx="273" cy="272" r="73" />
					<rect x="538" y="83" width="376" height="377" />
					<rect x="569" y="116" width="314" height="313" />
					<rect x="611" y="157" width="230" height="230" />
					<rect x="650" y="196" width="152" height="152" />
				</svg>
			</div>
			<div className="dashboard-amplify-story__page" aria-hidden="true">
				<SamplePageHeader />
				<span className="dashboard-amplify-story__page-eyebrow">
					{ __( 'Overall assessment' ) }
				</span>
				<span className="dashboard-amplify-story__page-title">
					{ __( 'Your homepage at a glance' ) }
				</span>
				{ [
					{ value: 60, label: __( 'First-time visitors' ) },
					{ value: 51, label: __( 'AI systems' ) },
				].map( ( { value, label } ) => (
					<div key={ label } className="dashboard-amplify-story__page-perspective">
						<SampleRing value={ value } />
						<span>
							<b>{ label }</b>
							<i>{ __( 'Needs Work' ) }</i>
						</span>
					</div>
				) ) }
				<b className="dashboard-amplify-story__page-heading">{ __( 'What’s working' ) }</b>
				<span className="dashboard-amplify-story__page-lines" />
				<b className="dashboard-amplify-story__page-heading">{ __( 'What to improve' ) }</b>
				<span className="dashboard-amplify-story__page-lines" />
			</div>
			<div className="dashboard-amplify-story__page" aria-hidden="true">
				<SamplePageHeader />
				<span className="dashboard-amplify-story__page-eyebrow">{ __( 'Score summary' ) }</span>
				<span className="dashboard-amplify-story__page-title">
					{ __( 'How your page performed' ) }
				</span>
				<div className="dashboard-amplify-story__page-scores">
					{ ( [ 'human', 'ai' ] as const ).map( ( type ) => (
						<div key={ type }>
							{ perspectives[ type ].metrics.map( ( metric ) => {
								const score = metric.reportScore;
								return (
									<div
										key={ metric.label }
										className="dashboard-amplify-story__page-score"
										data-severity={ severityFor( score, metric.max ) }
									>
										<span>{ metric.label }</span>
										<b>{ `${ score }/${ metric.max }` }</b>
										<em>
											<i style={ { width: `${ ( score / metric.max ) * 100 }%` } } />
										</em>
									</div>
								);
							} ) }
						</div>
					) ) }
				</div>
			</div>
		</a>
	);
}
