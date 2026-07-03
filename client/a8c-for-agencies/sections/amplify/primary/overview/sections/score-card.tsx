import { Badge } from '@automattic/components';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useState } from 'react';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './score-card.scss';

type Mode = 'human' | 'ai';

type Severity = 'good' | 'warn' | 'danger';

type Metric = {
	label: string;
	score: number;
	max: number;
};

type ModeData = {
	score: number;
	body: string;
	metrics: Metric[];
};

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SAMPLE_URL = 'yourgroovydomain.com';

function severityFor( score: number, max: number ): Severity {
	const pct = ( score / max ) * 100;
	if ( pct >= 80 ) {
		return 'good';
	}
	if ( pct >= 50 ) {
		return 'warn';
	}
	return 'danger';
}

function thresholdLabel( score: number ): string {
	// 80–100 Strong · 50–79 Needs work · 0–49 At risk
	if ( score >= 80 ) {
		return __( 'Strong' );
	}
	if ( score >= 50 ) {
		return __( 'Needs work' );
	}
	return __( 'At risk' );
}

function severityColor( severity: Severity ): string {
	switch ( severity ) {
		case 'good':
			return 'var(--color-success)';
		case 'warn':
			return 'var(--color-warning-50)';
		default:
			return 'var(--color-error)';
	}
}

// Hoisted to module scope — static demo data, no reason to reallocate on every render.
const MODES: Record< Mode, ModeData > = {
	human: {
		score: 86,
		body: __(
			"Your client's site is set up to win business. A few targeted refinements will keep you ahead."
		),
		metrics: [
			{ label: __( 'Trust signals' ), score: 16, max: 18 },
			{ label: __( 'Contact & conversion' ), score: 13, max: 15 },
			{ label: __( 'SEO' ), score: 10, max: 13 },
			{ label: __( 'Mobile experience' ), score: 12, max: 13 },
			{ label: __( 'Content quality' ), score: 10, max: 12 },
			{ label: __( 'Design & experience' ), score: 9, max: 11 },
			{ label: __( 'Accessibility' ), score: 8, max: 10 },
			{ label: __( 'Audience resonance' ), score: 8, max: 8 },
		],
	},
	ai: {
		score: 42,
		body: __(
			"AI tools can't read or rank your client's site reliably yet. These gaps are likely costing you visibility."
		),
		metrics: [
			{ label: __( 'Technical health' ), score: 12, max: 20 },
			{ label: __( 'Structured data' ), score: 6, max: 18 },
			{ label: __( 'AEO readiness' ), score: 6, max: 16 },
			{ label: __( 'E-E-A-T signals' ), score: 6, max: 14 },
			{ label: __( 'Content freshness' ), score: 5, max: 12 },
			{ label: __( 'Entity clarity' ), score: 4, max: 10 },
			{ label: __( 'Content specificity' ), score: 3, max: 7 },
			{ label: 'llms.txt', score: 0, max: 3 },
		],
	},
};

export default function AmplifyScoreCard() {
	const dispatch = useDispatch();
	const [ mode, setMode ] = useState< Mode >( 'human' );

	const handleModeChange = ( nextMode: Mode ) => {
		if ( nextMode === mode ) {
			return;
		}
		dispatch(
			recordTracksEvent( 'calypso_a4a_amplify_mode_toggle', {
				mode: nextMode,
				surface: 'score_card',
			} )
		);
		setMode( nextMode );
	};

	const data = MODES[ mode ];
	const ringSeverity = severityFor( data.score, 100 );
	const offset = CIRCUMFERENCE - ( data.score / 100 ) * CIRCUMFERENCE;

	return (
		<Card elevation={ 3 }>
			<CardBody>
				<VStack spacing={ 5 }>
					<HStack justify="space-between">
						<Text as="code" variant="muted" size={ 12 }>
							{ SAMPLE_URL }
						</Text>
						<Badge type="success">{ __( 'Audit complete' ) }</Badge>
					</HStack>

					<ToggleGroupControl
						__next40pxDefaultSize
						isBlock
						hideLabelFromVision
						label={ __( 'Score mode' ) }
						value={ mode }
						onChange={ ( value ) => handleModeChange( value as Mode ) }
					>
						<ToggleGroupControlOption value="human" label={ __( 'Human-centric analysis' ) } />
						<ToggleGroupControlOption value="ai" label={ __( 'AI analysis' ) } />
					</ToggleGroupControl>

					<HStack spacing={ 5 } alignment="center" justify="flex-start">
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
						<VStack spacing={ 1 }>
							<Text weight={ 700 } size={ 15 } color={ severityColor( ringSeverity ) }>
								{ thresholdLabel( data.score ) }
							</Text>
							<Text variant="muted" size={ 13 }>
								{ preventWidows( data.body ) }
							</Text>
						</VStack>
					</HStack>

					<VStack spacing={ 2 }>
						{ data.metrics.map( ( metric ) => {
							const sev = severityFor( metric.score, metric.max );
							const pct = ( metric.score / metric.max ) * 100;
							return (
								<div key={ metric.label } className="amplify-landing-bar-row">
									<Text variant="muted" size={ 12 }>
										{ metric.label }
									</Text>
									<div className="amplify-landing-bar-track">
										<div
											className={ clsx( 'amplify-landing-bar-fill', sev ) }
											style={ { inlineSize: `${ pct }%` } }
										/>
									</div>
									<Text size={ 11 } weight={ 600 } align="end" color={ severityColor( sev ) }>
										{ metric.score } / { metric.max }
									</Text>
								</div>
							);
						} ) }
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
