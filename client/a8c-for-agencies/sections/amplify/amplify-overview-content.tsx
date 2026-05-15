import './style.scss';

import { __ } from '@wordpress/i18n';
import AmplifyAiSection from './amplify-ai-section';
import AmplifyAiWorkflow from './amplify-ai-workflow';
import AmplifyHowItWorks from './amplify-how-it-works';
import AmplifyHumanSection from './amplify-human-section';
import AmplifyScoreCard from './amplify-score-card';
import AmplifySiteSelect from './amplify-site-select';

// Mock monthly usage — will be sourced from the agency's tier in a follow-up.
const REMAINING_AUDITS = 1;
const MONTHLY_AUDIT_LIMIT = 3;

type Props = {
	onSiteSelected: ( url: string ) => void;
};

export default function AmplifyOverviewContent( { onSiteSelected }: Props ) {
	return (
		<div className="amplify-landing">
			{ /* ── HERO ── */ }
			<section className="amplify-landing-hero">
				<div className="amplify-landing-hero-text">
					<h1 className="amplify-landing-h1">
						{ __( 'Your clients want more business. Find out what their site is doing about it.' ) }
					</h1>
					<p className="amplify-landing-sub">
						{ __(
							'Amplify scans your clients’ connected sites through two lenses: how their prospective clients perceive them on first visit, and how AI tools like ChatGPT and Perplexity read and rank them. Run a scan in minutes. Find what’s holding them back. Deliver fixes that prove your value and build trust.'
						) }
					</p>
					<AmplifySiteSelect onSiteSelected={ onSiteSelected } />
					<p className="amplify-landing-usage">
						{ `${ REMAINING_AUDITS } of ${ MONTHLY_AUDIT_LIMIT } ${ __(
							'scans remaining this month.'
						) }` }
					</p>
				</div>
				<div className="amplify-landing-hero-visual">
					<AmplifyScoreCard />
				</div>
			</section>

			{ /* ── HOW IT WORKS (interactive browser mockup) ── */ }
			<section className="amplify-landing-how-section">
				<AmplifyHowItWorks />
			</section>

			{ /* ── HUMAN-CENTRIC ANALYSIS ── */ }
			<section className="amplify-landing-human-section">
				<AmplifyHumanSection />
			</section>

			{ /* ── AI ANALYSIS ── */ }
			<section className="amplify-landing-ai-section">
				<AmplifyAiSection />
			</section>

			{ /* ── PROMPT WORKFLOW ── */ }
			<section className="amplify-landing-workflow-section">
				<AmplifyAiWorkflow />
			</section>
		</div>
	);
}
