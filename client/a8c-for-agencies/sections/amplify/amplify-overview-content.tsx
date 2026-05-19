import './style.scss';

import { __ } from '@wordpress/i18n';
import PageSectionColumns from 'calypso/a8c-for-agencies/components/page-section-columns';
import AmplifyAiSection from './amplify-ai-section';
import AmplifyAiWorkflow from './amplify-ai-workflow';
import AmplifyFAQ from './amplify-faq';
import AmplifyHowItWorks from './amplify-how-it-works';
import AmplifyHumanSection from './amplify-human-section';
import AmplifyScoreCard from './amplify-score-card';
import AmplifySiteSelect from './amplify-site-select';

type Props = {
	onSiteSelected: ( url: string ) => void;
};

const ZEBRA_BG = { color: 'var(--color-neutral-0)' };

export default function AmplifyOverviewContent( { onSiteSelected }: Props ) {
	return (
		<>
			{ /* ── HERO ── */ }
			<PageSectionColumns className="amplify-landing-hero">
				<PageSectionColumns.Column>
					{ /*
						Wrap the hero content in a single div so PageSectionColumns'
						column-level gap (32px between siblings) doesn't stack on top
						of the per-element margins below. The h1 → sub → selector
						spacing is then governed entirely by margin-block-end on each
						element, matching the criteria-section rhythm.
					*/ }
					<div className="amplify-landing-hero-text">
						<h1 className="amplify-landing-h1">
							{ __(
								'Your clients want more business. Find out what their site is doing about it.'
							) }
						</h1>
						<p className="amplify-landing-sub">
							{ __(
								"Amplify scans your clients' connected sites through two lenses: how their prospective clients perceive them on first visit, and how AI tools like ChatGPT and Perplexity read and rank them. Run a scan in minutes. Find what's holding them back. Deliver fixes that prove your value and build trust."
							) }
						</p>
						<AmplifySiteSelect onSiteSelected={ onSiteSelected } />
						{ /*
							TODO: monthly scan usage counter. Previously rendered hardcoded
							"1 of 3 scans remaining this month" which was misleading to real
							users. Restore once the agency's tier-based allocation and
							consumed-count are wired up (see amplify-todo.md item 10:
							"Tiering structure and analysis allocation").
						*/ }
					</div>
				</PageSectionColumns.Column>
				<PageSectionColumns.Column alignCenter>
					<AmplifyScoreCard />
				</PageSectionColumns.Column>
			</PageSectionColumns>

			{ /* ── HOW IT WORKS (interactive browser mockup) ── */ }
			<PageSectionColumns background={ ZEBRA_BG }>
				<PageSectionColumns.Column fullWidth>
					<AmplifyHowItWorks />
				</PageSectionColumns.Column>
			</PageSectionColumns>

			{ /* ── HUMAN-CENTRIC ANALYSIS ── */ }
			<PageSectionColumns>
				<PageSectionColumns.Column fullWidth>
					<AmplifyHumanSection />
				</PageSectionColumns.Column>
			</PageSectionColumns>

			{ /* ── AI ANALYSIS ── */ }
			<PageSectionColumns background={ ZEBRA_BG }>
				<PageSectionColumns.Column fullWidth>
					<AmplifyAiSection />
				</PageSectionColumns.Column>
			</PageSectionColumns>

			{ /* ── PROMPT WORKFLOW (renders its own PageSectionColumns) ── */ }
			<AmplifyAiWorkflow />

			{ /* ── FAQ (renders its own PageSectionColumns with the zebra bg) ── */ }
			<AmplifyFAQ />
		</>
	);
}
