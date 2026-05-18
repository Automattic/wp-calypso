import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

type Mode = 'human' | 'ai';

type Severity = 'good' | 'warn' | 'danger';

type Pin = {
	top: string;
	left: string;
	label: string;
	severity: Severity;
};

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
const MODES: Record< Mode, ModeData > = {
	human: {
		score: 86,
		thresholdLabel: __( 'Strong' ),
		modeLabel: __( 'Human-centric analysis' ),
		improveLabel: __( 'Improve for humans' ),
		pins: [
			{ top: '14%', left: '7%', label: __( 'Headline could be sharper' ), severity: 'warn' },
			{ top: '5%', left: '58%', label: __( 'Nav links not descriptive' ), severity: 'warn' },
			{
				top: '33%',
				left: '7%',
				label: __( 'No social proof above the fold' ),
				severity: 'danger',
			},
			{ top: '44%', left: '7%', label: __( 'CTA copy lacks urgency' ), severity: 'warn' },
			{
				top: '22%',
				left: '60%',
				label: __( 'Hero clashes with site palette' ),
				severity: 'warn',
			},
			{ top: '75%', left: '6%', label: __( 'Portfolio quality: solid' ), severity: 'good' },
			{ top: '77%', left: '38%', label: __( 'Missing testimonials' ), severity: 'danger' },
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
			{ top: '14%', left: '7%', label: __( 'H1 missing schema markup' ), severity: 'danger' },
			{ top: '5%', left: '50%', label: __( 'Entity type undefined' ), severity: 'danger' },
			{ top: '27%', left: '7%', label: __( 'Thin content detected' ), severity: 'warn' },
			{ top: '44%', left: '7%', label: __( 'No FAQ structured data' ), severity: 'danger' },
			{ top: '22%', left: '60%', label: __( 'No breadcrumb schema' ), severity: 'warn' },
			{ top: '75%', left: '6%', label: __( 'Content freshness: stale' ), severity: 'warn' },
			{ top: '77%', left: '38%', label: __( 'AEO readiness: 38%' ), severity: 'danger' },
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
		<div className="amplify-landing-how">
			<div className="amplify-landing-how-header">
				<div>
					<p className="amplify-landing-how-eyebrow">{ __( 'How it works' ) }</p>
					<h2 className="amplify-landing-how-title">{ __( 'See it in action' ) }</h2>
				</div>
				<div
					className="amplify-landing-how-mode-toggle"
					role="tablist"
					aria-label={ __( 'Preview mode' ) }
				>
					<Button
						role="tab"
						aria-selected={ mode === 'human' }
						className={ clsx( 'amplify-landing-how-mode-btn', {
							'is-active': mode === 'human',
						} ) }
						onClick={ () => handleModeChange( 'human' ) }
					>
						{ __( 'Human-centric analysis' ) }
					</Button>
					<Button
						role="tab"
						aria-selected={ mode === 'ai' }
						className={ clsx( 'amplify-landing-how-mode-btn', {
							'is-active': mode === 'ai',
						} ) }
						onClick={ () => handleModeChange( 'ai' ) }
					>
						{ __( 'AI analysis' ) }
					</Button>
				</div>
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
									{ pin.label }
								</div>
							</div>
						) ) }
					</div>

					<div className="amplify-landing-how-overlay">
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
						<button type="button" className="amplify-landing-how-overlay-btn">
							{ data.improveLabel }
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
