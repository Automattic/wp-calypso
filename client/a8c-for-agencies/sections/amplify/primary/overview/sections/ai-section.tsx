import { __ } from '@wordpress/i18n';
import PageSectionColumns from 'calypso/a8c-for-agencies/components/page-section-columns';
import AmplifyCriteriaSection from './criteria-section';
import type { Criterion, CriteriaStat } from './criteria-section';

const ZEBRA_BG = { color: 'var(--color-neutral-0)' };

const STATS: CriteriaStat[] = [
	{ num: '100M', label: __( 'ChatGPT users in just 2 months' ) },
	{ num: '20–30%', label: __( 'More clicks with structured data' ) },
	{ num: '0', label: __( 'Visibility for sites that block AI crawlers' ) },
];

const CRITERIA: Criterion[] = [
	{
		id: 'technical-health',
		num: '01',
		title: __( 'Technical Health' ),
		summary: __(
			'Can AI tools access, crawl, and render the site? If a crawler cannot reach the content, nothing else matters.'
		),
	},
	{
		id: 'structured-data',
		num: '02',
		title: __( 'Structured Data' ),
		summary: __(
			'Schema markup tells AI tools exactly what the site is about rather than making them infer it. The difference between an AI accurately describing your client and producing a generic summary.'
		),
	},
	{
		id: 'aeo-readiness',
		num: '03',
		title: __( 'AEO Readiness' ),
		summary: __(
			'Answer Engine Optimization. Is the content structured to surface in AI-generated answers? AI tools prioritize pages that answer questions directly, not pages that bury key information.'
		),
	},
	{
		id: 'eeat-signals',
		num: '04',
		title: __( 'E-E-A-T Signals' ),
		summary: __(
			"Experience, Expertise, Authoritativeness, Trustworthiness. Google's quality framework and the backbone of how AI tools evaluate whether a source is worth citing."
		),
	},
	{
		id: 'content-freshness',
		num: '05',
		title: __( 'Content Freshness' ),
		summary: __(
			'Is the content up to date? AI tools and search engines both treat stale content as a signal of lower reliability.'
		),
	},
	{
		id: 'entity-clarity',
		num: '06',
		title: __( 'Entity Clarity' ),
		summary: __(
			'Does the site make it unambiguous who this business is? AI knowledge graphs depend on clear, consistent entity signals across the web.'
		),
	},
	{
		id: 'content-specificity',
		num: '07',
		title: __( 'Content Specificity' ),
		summary: __(
			'Does the content say something specific, or could it describe any business in the same category? Generic content is the most common reason AI tools skip a site when generating recommendations.'
		),
	},
	{
		id: 'llms-txt',
		num: '08',
		title: 'llms.txt',
		summary: __(
			'An emerging standard that lets businesses publish a machine-readable summary of their site specifically for large language models.'
		),
	},
];

export default function AmplifyAiSection() {
	return (
		<PageSectionColumns background={ ZEBRA_BG }>
			<PageSectionColumns.Column fullWidth>
				<AmplifyCriteriaSection
					eyebrow={ __( 'AI analysis' ) }
					title={
						<>
							{ __( 'Your clients’ next customers are searching with AI.' ) }
							<br />
							{ __( 'Ensure they can be found.' ) }
						</>
					}
					intro={ __(
						'ChatGPT reached 100 million users in two months. Perplexity now fields tens of millions of searches a day. Google AI Overviews appear above organic results for hundreds of millions of queries. When your clients’ customers search for products or services using AI, your clients’ sites need to be readable, structured, and citable. Most aren’t, and most agencies haven’t checked.'
					) }
					stats={ STATS }
					criteria={ CRITERIA }
				/>
			</PageSectionColumns.Column>
		</PageSectionColumns>
	);
}
