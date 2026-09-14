import {
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import { useState } from 'react';
import PageSectionColumns from 'calypso/a8c-for-agencies/components/page-section-columns';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './how-it-works.scss';

const ZEBRA_BG = { color: 'var(--color-neutral-0)' };

type Mode = 'human' | 'ai';

type Severity = 'good' | 'warn' | 'danger';

type Pin = {
	top: string;
	left: string;
	label: string;
	/**
	 * Criterion name from the Amplify scoring rubric (Trust Signals, Audience
	 * Resonance, etc.). Rendered as an eyebrow tag above the pin label so the
	 * demo visibly maps each finding to the framework it scores against. Keep
	 * these in sync with the rubric in skills/human/SKILL.md and skills/ai/SKILL.md.
	 */
	criterion: string;
	severity: Severity;
	/**
	 * Score impact for this finding in the rubric. Negative for points lost,
	 * positive for points earned. Magnitude reflects the max points of the
	 * underlying signal (or partial credit if applicable). Rendered inline next
	 * to the label so viewers see how findings ladder up to the total score.
	 */
	pointsImpact: number;
};

function formatPointsImpact( pts: number ): string {
	if ( pts === 0 ) {
		return '';
	}
	const abs = Math.abs( pts );
	const sign = pts > 0 ? '+' : '−';
	return sprintf(
		// translators: %1$s is a +/− sign, %2$d is the absolute point value.
		_n( '%1$s%2$d pt', '%1$s%2$d pts', abs ),
		sign,
		abs
	);
}

type Bar = {
	label: string;
	value: number;
};

type ModeData = {
	score: number;
	thresholdLabel: string;
	modeLabel: string;
	improveLabel: string;
	pins: Pin[];
	bars: Bar[];
};

function severityFor( value: number ): Severity {
	if ( value >= 80 ) {
		return 'good';
	}
	if ( value >= 50 ) {
		return 'warn';
	}
	return 'danger';
}

// Mock agency site shown inside the browser frame. This is decorative example
// content meant to look like a real agency homepage; it isn't translated.
function HowMockSite() {
	return (
		<div className="amplify-landing-how-mock" aria-hidden="true">
			<nav className="amplify-landing-how-mock-nav">
				<div className="amplify-landing-how-mock-logo">
					<div className="amplify-landing-how-mock-logo-mark">CS</div>
					<span className="amplify-landing-how-mock-logo-name">Crestline Studio</span>
				</div>
				<div className="amplify-landing-how-mock-nav-links">
					<span>Work</span>
					<span>Services</span>
					<span>Studio</span>
					<span>Contact</span>
				</div>
				<div className="amplify-landing-how-mock-nav-cta">Start a project</div>
			</nav>

			<div className="amplify-landing-how-mock-hero">
				<div>
					<div className="amplify-landing-how-mock-hero-eyebrow">Digital agency · Est. 2016</div>
					<div className="amplify-landing-how-mock-hero-h1">
						We build brands
						<br />
						that win online.
					</div>
					<div className="amplify-landing-how-mock-hero-sub">
						Crestline partners with ambitious companies to craft digital experiences that drive
						real, measurable growth.
					</div>
					<div className="amplify-landing-how-mock-cta-row">
						<div className="amplify-landing-how-mock-btn-dark">See our work</div>
						<div className="amplify-landing-how-mock-btn-outline">Get in touch</div>
					</div>
				</div>
				<div className="amplify-landing-how-mock-hero-right">
					<div className="amplify-landing-how-mock-stat-label">Avg. client growth</div>
					<div className="amplify-landing-how-mock-stat-num">+143%</div>
					<div className="amplify-landing-how-mock-stat-sub">in the first 12 months</div>
				</div>
			</div>

			<div className="amplify-landing-how-mock-projects">
				<div className="amplify-landing-how-mock-card">
					<div
						className="amplify-landing-how-mock-card-thumb"
						style={ { background: 'linear-gradient(135deg, #1e3a5f, #2d6a9f)' } }
					/>
					<div className="amplify-landing-how-mock-card-body">
						<div className="amplify-landing-how-mock-card-client">Fintech</div>
						<div className="amplify-landing-how-mock-card-title">Vaultr: Brand & Web Redesign</div>
					</div>
				</div>
				<div className="amplify-landing-how-mock-card">
					<div
						className="amplify-landing-how-mock-card-thumb"
						style={ { background: 'linear-gradient(135deg, #3d1f5c, #7c3aed)' } }
					/>
					<div className="amplify-landing-how-mock-card-body">
						<div className="amplify-landing-how-mock-card-client">SaaS</div>
						<div className="amplify-landing-how-mock-card-title">Loopkit Growth Site</div>
					</div>
				</div>
				<div className="amplify-landing-how-mock-card">
					<div
						className="amplify-landing-how-mock-card-thumb"
						style={ { background: 'linear-gradient(135deg, #0f3d2e, #059669)' } }
					/>
					<div className="amplify-landing-how-mock-card-body">
						<div className="amplify-landing-how-mock-card-client">E-commerce</div>
						<div className="amplify-landing-how-mock-card-title">Brightly: Store & Brand</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Hoisted to module scope — static demo data, no reason to reallocate on every render.
// Pin labels and criteria mirror the real scoring rubric in skills/human/SKILL.md
// and skills/ai/SKILL.md so the demo reflects what the tool actually measures.
const MODES: Record< Mode, ModeData > = {
	human: {
		score: 86,
		thresholdLabel: __( 'Strong' ),
		modeLabel: __( 'Human-centric analysis' ),
		improveLabel: __( 'Improve for humans' ),
		pins: [
			{
				top: '14%',
				left: '7%',
				label: __( 'Hero headline too vague' ),
				criterion: __( 'Audience Resonance' ),
				severity: 'warn',
				pointsImpact: -1,
			},
			{
				top: '5%',
				left: '58%',
				label: __( '4 nav items: focused choices' ),
				criterion: __( 'Design & Experience' ),
				severity: 'good',
				pointsImpact: 1,
			},
			{
				top: '33%',
				left: '7%',
				label: __( 'No client logos visible' ),
				criterion: __( 'Trust Signals' ),
				severity: 'danger',
				pointsImpact: -2,
			},
			{
				top: '44%',
				left: '7%',
				label: __( 'CTA copy is generic' ),
				criterion: __( 'Contact & Conversion' ),
				severity: 'warn',
				pointsImpact: -2,
			},
			{
				top: '22%',
				left: '60%',
				label: __( 'Aesthetic polish: adequate' ),
				criterion: __( 'Design & Experience' ),
				severity: 'warn',
				pointsImpact: -1,
			},
			{
				top: '75%',
				left: '6%',
				label: __( 'Case studies linked' ),
				criterion: __( 'Trust Signals' ),
				severity: 'good',
				pointsImpact: 1,
			},
			{
				top: '77%',
				left: '38%',
				label: __( 'No testimonials with attribution' ),
				criterion: __( 'Trust Signals' ),
				severity: 'danger',
				pointsImpact: -3,
			},
		],
		bars: [
			{ label: __( 'Trust signals' ), value: 89 },
			{ label: __( 'Mobile experience' ), value: 92 },
			{ label: __( 'SEO' ), value: 77 },
		],
	},
	ai: {
		score: 42,
		thresholdLabel: __( 'At risk' ),
		modeLabel: __( 'AI analysis' ),
		improveLabel: __( 'Improve for AI' ),
		pins: [
			{
				top: '14%',
				left: '7%',
				label: __( 'Organization schema missing' ),
				criterion: __( 'Structured Data' ),
				severity: 'danger',
				pointsImpact: -5,
			},
			{
				top: '5%',
				left: '50%',
				label: __( 'Clear entity identity' ),
				criterion: __( 'Entity Clarity' ),
				severity: 'good',
				pointsImpact: 3,
			},
			{
				top: '27%',
				left: '7%',
				label: __( 'Service detail too thin' ),
				criterion: __( 'Content Specificity' ),
				severity: 'warn',
				pointsImpact: -1,
			},
			{
				top: '44%',
				left: '7%',
				label: __( 'No FAQ schema' ),
				criterion: __( 'Structured Data' ),
				severity: 'danger',
				pointsImpact: -3,
			},
			{
				top: '22%',
				left: '60%',
				label: __( 'GPTBot blocked in robots.txt' ),
				criterion: __( 'Technical Health' ),
				severity: 'danger',
				pointsImpact: -7,
			},
			{
				top: '75%',
				left: '6%',
				label: __( 'Copyright year current' ),
				criterion: __( 'Content Freshness' ),
				severity: 'good',
				pointsImpact: 3,
			},
			{
				top: '77%',
				left: '38%',
				label: __( 'No question-framed headings' ),
				criterion: __( 'AEO Readiness' ),
				severity: 'danger',
				pointsImpact: -2,
			},
		],
		bars: [
			{ label: __( 'Technical health' ), value: 60 },
			{ label: __( 'AEO readiness' ), value: 38 },
			{ label: __( 'Structured data' ), value: 33 },
		],
	},
};

export default function AmplifyHowItWorks() {
	const dispatch = useDispatch();
	const [ mode, setMode ] = useState< Mode >( 'human' );

	const handleModeChange = ( nextMode: Mode ) => {
		if ( nextMode === mode ) {
			return;
		}
		dispatch(
			recordTracksEvent( 'calypso_a4a_amplify_mode_toggle', {
				mode: nextMode,
				surface: 'how_it_works',
			} )
		);
		setMode( nextMode );
	};

	const data = MODES[ mode ];
	const ringSeverity = severityFor( data.score );

	return (
		<PageSectionColumns background={ ZEBRA_BG }>
			<PageSectionColumns.Column fullWidth>
				<div className="amplify-landing-how">
					<div className="amplify-landing-how-header">
						<VStack spacing={ 2 }>
							<Text upperCase variant="muted" size={ 11 } weight={ 600 } letterSpacing="1px">
								{ __( 'How it works' ) }
							</Text>
							<Heading level={ 2 }>{ __( 'Two lenses. One complete picture.' ) }</Heading>
						</VStack>
						<ToggleGroupControl
							__next40pxDefaultSize
							isAdaptiveWidth
							hideLabelFromVision
							label={ __( 'Preview mode' ) }
							value={ mode }
							onChange={ ( value ) => handleModeChange( value as Mode ) }
							className="amplify-landing-how-mode-toggle"
						>
							<ToggleGroupControlOption value="human" label={ __( 'Human-centric analysis' ) } />
							<ToggleGroupControlOption value="ai" label={ __( 'AI analysis' ) } />
						</ToggleGroupControl>
					</div>

					<div className="amplify-landing-how-browser">
						<div className="amplify-landing-how-browser-chrome">
							<div className="amplify-landing-how-browser-dots">
								<span className="amplify-landing-how-browser-dot is-r" />
								<span className="amplify-landing-how-browser-dot is-y" />
								<span className="amplify-landing-how-browser-dot is-g" />
							</div>
							<div className="amplify-landing-how-browser-address">
								<div className="amplify-landing-how-browser-bar">crestlinestudio.com</div>
							</div>
						</div>

						<div className="amplify-landing-how-preview">
							<HowMockSite />

							<div className="amplify-landing-how-pins" aria-hidden="true">
								{ data.pins.map( ( pin, index ) => (
									<div
										key={ `${ mode }-${ index }` }
										className="amplify-landing-how-pin is-visible"
										style={ {
											insetBlockStart: pin.top,
											insetInlineStart: pin.left,
											transitionDelay: `${ index * 60 }ms`,
										} }
									>
										<div className={ clsx( 'amplify-landing-how-pin-dot', pin.severity ) } />
										<div className={ clsx( 'amplify-landing-how-pin-label', pin.severity ) }>
											<span className="amplify-landing-how-pin-label-criterion">
												{ pin.criterion }
											</span>
											<span className="amplify-landing-how-pin-label-text">
												{ pin.label }
												<span className="amplify-landing-how-pin-label-score">
													{ formatPointsImpact( pin.pointsImpact ) }
												</span>
											</span>
										</div>
									</div>
								) ) }
							</div>

							<div className="amplify-landing-how-overlay" aria-hidden="true">
								<div className="amplify-landing-how-overlay-mode">{ data.modeLabel }</div>
								<div className="amplify-landing-how-overlay-score-row">
									<span className={ clsx( 'amplify-landing-how-overlay-num', ringSeverity ) }>
										{ data.score }
									</span>
									<span className="amplify-landing-how-overlay-of">/ 100</span>
								</div>
								<div className={ clsx( 'amplify-landing-how-overlay-title', ringSeverity ) }>
									{ data.thresholdLabel }
								</div>
								<div className="amplify-landing-how-overlay-bars">
									{ data.bars.map( ( bar ) => {
										const sev = severityFor( bar.value );
										return (
											<div key={ bar.label } className="amplify-landing-how-overlay-row">
												<span className="amplify-landing-how-overlay-row-label">{ bar.label }</span>
												<div className="amplify-landing-how-overlay-track">
													<div
														className={ clsx( 'amplify-landing-how-overlay-fill', sev ) }
														style={ { inlineSize: `${ bar.value }%` } }
													/>
												</div>
												<span className={ clsx( 'amplify-landing-how-overlay-val', sev ) }>
													{ bar.value }
												</span>
											</div>
										);
									} ) }
								</div>
								<div className="amplify-landing-how-overlay-btn">{ data.improveLabel }</div>
							</div>
						</div>
					</div>
				</div>
			</PageSectionColumns.Column>
		</PageSectionColumns>
	);
}
