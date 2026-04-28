import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useState } from 'react';

type Mode = 'human' | 'ai';

type Metric = {
	label: string;
	value: number;
};

type ModeData = {
	score: number;
	title: string;
	body: string;
	metrics: Metric[];
};

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SAMPLE_URL = 'yourgroovydomain.com';

function severityFor( value: number ): 'good' | 'warn' | 'danger' {
	if ( value >= 80 ) {
		return 'good';
	}
	if ( value >= 50 ) {
		return 'warn';
	}
	return 'danger';
}

export default function AmplifyScoreCard() {
	const [ mode, setMode ] = useState< Mode >( 'human' );

	const modes: Record< Mode, ModeData > = {
		human: {
			score: 76,
			title: __( 'Room to amplify' ),
			body: __(
				'Strong foundations, but a few areas may be costing you clients before they reach out.'
			),
			metrics: [
				{ label: __( 'First impressions' ), value: 88 },
				{ label: __( 'Trust signals' ), value: 82 },
				{ label: __( 'Portfolio quality' ), value: 78 },
				{ label: __( 'SEO' ), value: 71 },
				{ label: __( 'Service clarity' ), value: 65 },
			],
		},
		ai: {
			score: 52,
			title: __( 'Needs attention' ),
			body: __(
				'AI agents are struggling to read and rank your site. These gaps are costing you visibility.'
			),
			metrics: [
				{ label: __( 'Technical performance' ), value: 74 },
				{ label: __( 'Content specificity' ), value: 66 },
				{ label: __( 'Crawl health' ), value: 61 },
				{ label: __( 'AEO readiness' ), value: 48 },
				{ label: __( 'Schema data' ), value: 29 },
			],
		},
	};

	const data = modes[ mode ];
	const ringSeverity = severityFor( data.score );
	const offset = CIRCUMFERENCE - ( data.score / 100 ) * CIRCUMFERENCE;

	return (
		<div className="amplify-landing-score-card">
			<div className="amplify-landing-score-card-header">
				<span className="amplify-landing-score-url">{ SAMPLE_URL }</span>
				<span className="amplify-landing-score-status">{ __( 'Audit complete' ) }</span>
			</div>

			<div className="amplify-landing-mode-toggle" role="tablist" aria-label={ __( 'Score mode' ) }>
				<button
					type="button"
					role="tab"
					aria-selected={ mode === 'human' }
					className={ clsx( 'amplify-landing-mode-btn', {
						'is-active': mode === 'human',
					} ) }
					onClick={ () => setMode( 'human' ) }
				>
					{ __( 'Human mode' ) }
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={ mode === 'ai' }
					className={ clsx( 'amplify-landing-mode-btn', {
						'is-active': mode === 'ai',
					} ) }
					onClick={ () => setMode( 'ai' ) }
				>
					{ __( 'AI mode' ) }
				</button>
			</div>

			<div className="amplify-landing-score-main">
				<div className="amplify-landing-score-ring">
					<svg viewBox="0 0 88 88" aria-hidden="true">
						<circle className="amplify-landing-ring-track" cx="44" cy="44" r={ RADIUS } />
						<circle
							className={ clsx( 'amplify-landing-ring-fill', ringSeverity ) }
							cx="44"
							cy="44"
							r={ RADIUS }
							strokeDasharray={ CIRCUMFERENCE }
							strokeDashoffset={ offset }
						/>
					</svg>
					<div className="amplify-landing-ring-label">
						<span className="amplify-landing-ring-num">{ data.score }</span>
						<span className="amplify-landing-ring-of">/ 100</span>
					</div>
				</div>
				<div>
					<div className="amplify-landing-score-title">{ data.title }</div>
					<div className="amplify-landing-score-body">{ data.body }</div>
				</div>
			</div>

			<div className="amplify-landing-bars">
				{ data.metrics.map( ( metric ) => {
					const sev = severityFor( metric.value );
					return (
						<div key={ metric.label } className="amplify-landing-bar-row">
							<span className="amplify-landing-bar-label">{ metric.label }</span>
							<div className="amplify-landing-bar-track">
								<div
									className={ clsx( 'amplify-landing-bar-fill', sev ) }
									style={ { inlineSize: `${ metric.value }%` } }
								/>
							</div>
							<span className={ clsx( 'amplify-landing-bar-val', sev ) }>{ metric.value }</span>
						</div>
					);
				} ) }
			</div>
		</div>
	);
}
