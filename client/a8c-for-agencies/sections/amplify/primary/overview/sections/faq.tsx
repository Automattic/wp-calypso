import {
	Panel,
	PanelBody,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import PageSectionColumns from 'calypso/a8c-for-agencies/components/page-section-columns';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './faq.scss';

// Hoisted to module scope — static data, no reason to reallocate on every render.
const FAQS = [
	{
		id: 'what-does-amplify-analyze',
		question: __( 'What does Amplify actually analyze?' ),
		answer: __(
			'Amplify evaluates your homepage through two lenses. Human Mode scores how a potential client perceives the site, covering trust signals, mobile experience, content quality, SEO, conversion paths, and more. AI Mode scores how AI tools like ChatGPT, Perplexity, and Gemini read and rank it, covering structured data, entity clarity, AEO readiness, E-E-A-T signals, and technical accessibility. Each lens produces a score out of 100 with a prioritized list of findings.'
		),
	},
	{
		id: 'how-is-the-score-calculated',
		question: __( 'How is the score calculated?' ),
		answer: __(
			'Every score is a combination of programmatic checks and AI analysis. Programmatic checks cover signals with one right answer: element presence, character counts, contrast ratios, HTTP status, and page speed measurements. AI analysis covers signals that require judgment, including visual polish, content clarity, trust signal quality, and audience resonance. Each criterion is weighted by its real-world impact on conversion or discoverability, and the total adds up to 100 points per mode.'
		),
	},
	{
		id: 'what-do-the-thresholds-mean',
		question: __( 'What do “Strong”, “Needs work”, and “At risk” mean?' ),
		answer: __(
			'These labels reflect where your score falls within a 100-point range. A score of 80 or above is Strong, meaning the site is well-positioned and likely making a good impression. A score of 50 to 79 is Needs work, meaning there are meaningful gaps that are likely costing you leads or visibility. Below 50 is At risk, meaning the site has significant issues that are actively working against you. The thresholds are the same across both Human Mode and AI Mode.'
		),
	},
	{
		id: 'homepage-only',
		question: __( 'Does Amplify analyze my entire site or just the homepage?' ),
		answer: __(
			'Right now, Amplify focuses on the homepage. This is where first impressions are made for both humans and AI tools, and where the highest-impact improvements tend to live. Full site analysis, covering interior pages, service pages, and blog content, is planned for a future release.'
		),
	},
	{
		id: 'how-long-does-it-take',
		question: __( 'How long does an analysis take?' ),
		answer: __(
			'Most analyses complete in 10 to 20 minutes, depending on the size and complexity of the site. You can navigate away as soon as the job is submitted. The report will appear in your reports dashboard when it is ready.'
		),
	},
	{
		id: 'how-often-should-i-run-it',
		question: __( 'How often should I run an analysis?' ),
		answer: __(
			'Amplify produces a point-in-time snapshot of your site. Run it after making significant changes to your homepage copy, design, or structure, and then again a few weeks later to see how the score has moved. For client sites, running it before a quarterly review gives you concrete, data-backed talking points about what has improved and what is still worth addressing.'
		),
	},
	{
		id: 'can-i-run-it-on-a-client-site',
		question: __( 'Can I run Amplify on a client’s site?' ),
		answer: __(
			'Yes. Amplify works on any site connected to your Automattic for Agencies account. Running it on a client site before a pitch lets you walk in with a report in hand and show them exactly what you would fix and why. It is a compelling way to demonstrate your expertise and win the contract. For existing clients, it is a strong addition to quarterly business reviews.'
		),
	},
	{
		id: 'score-accuracy',
		question: __( 'My score seems off. How accurate is it?' ),
		answer: __(
			'Amplify scores are directional indicators grounded in established research, including WCAG, Google Search Central, the Laws of UX, and Automattic expertise. They are not definitive verdicts. Programmatic signals are precise. Signals based on AI analysis carry a higher degree of interpretive variance and may not account for every site-specific context or intentional design decision. If something does not look right, treat it as a prompt for a conversation rather than a final ruling, and factor in your own knowledge of the site and its audience.'
		),
	},
];

export default function AmplifyFAQ() {
	const dispatch = useDispatch();

	const onToggle = useCallback(
		( id: string, isOpen: boolean ) => {
			dispatch(
				recordTracksEvent(
					isOpen ? 'calypso_a4a_amplify_faq_open' : 'calypso_a4a_amplify_faq_close',
					{ faq_id: id }
				)
			);
		},
		[ dispatch ]
	);

	return (
		<PageSectionColumns background={ { color: 'var(--color-neutral-0)' } }>
			<PageSectionColumns.Column fullWidth>
				<VStack spacing={ 6 }>
					<VStack spacing={ 2 }>
						<Heading level={ 2 }>{ __( 'Frequently asked questions' ) }</Heading>
						<Text variant="muted" size={ 16 }>
							{ __( 'Curious about the details? We have answers.' ) }
						</Text>
					</VStack>
					<Panel className="amplify-faq">
						{ FAQS.map( ( faq ) => (
							<PanelBody
								key={ faq.id }
								title={ faq.question }
								initialOpen={ false }
								onToggle={ ( isOpen ) => onToggle( faq.id, isOpen ) }
							>
								<Text>{ preventWidows( faq.answer ) }</Text>
							</PanelBody>
						) ) }
					</Panel>
				</VStack>
			</PageSectionColumns.Column>
		</PageSectionColumns>
	);
}
