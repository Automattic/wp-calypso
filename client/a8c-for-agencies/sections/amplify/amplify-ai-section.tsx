import { __ } from '@wordpress/i18n';

type Criterion = {
	id: string;
	num: string;
	title: string;
	points: number;
	summary: string;
	why: string;
	signals: string[];
	stats: string[];
};

const CRITERIA: Criterion[] = [
	{
		id: 'technical-health',
		num: '01',
		title: __( 'Technical Health' ),
		points: 20,
		summary: __(
			'Can AI tools access, crawl, and render the site? If a crawler cannot reach the content, nothing else matters.'
		),
		why: __(
			'Crawlability is the prerequisite for every other AI signal. A site that blocks AI bots — often by accident — is completely invisible to AI-generated answers, regardless of how good the content is.'
		),
		signals: [
			__( 'robots.txt — not blocking GPTBot, ClaudeBot, or anthropic-ai' ),
			__( 'noindex — homepage not accidentally flagged to prevent indexing' ),
			__( 'HTTPS — SSL active with no mixed content warnings' ),
			__( 'Sitemap — present, linked in robots.txt, with valid lastmod dates' ),
			__( 'JavaScript dependency — critical content readable in raw HTML' ),
		],
		stats: [
			__(
				'Sites that block GPTBot, ClaudeBot, or anthropic-ai are invisible to AI-generated answers'
			),
			__(
				'A misconfigured robots.txt can silently block all AI crawlers from ever reaching the content'
			),
			__( 'Pages rendered entirely in JavaScript are not reliably indexed by most AI crawlers' ),
		],
	},
	{
		id: 'structured-data',
		num: '02',
		title: __( 'Structured Data' ),
		points: 18,
		summary: __(
			'Schema markup tells AI tools exactly what the site is about rather than making them infer it. The difference between an AI accurately describing your client and producing a generic summary.'
		),
		why: __(
			'Without structured data, AI tools guess. With it, they get an unambiguous, machine-readable record of the business, its services, and its social proof — and cite it with confidence.'
		),
		signals: [
			__( 'Organization schema — name, URL, logo, description, sameAs social profiles' ),
			__( 'Open Graph and Twitter Card meta — og:title, og:description, og:image' ),
			__( 'Service schema — individual services in structured markup' ),
			__( 'FAQ schema — Q&A content marked for direct AI extraction' ),
			__( 'Review / AggregateRating schema — testimonials readable by crawlers' ),
		],
		stats: [
			__( 'Sites with structured data get 20 to 30% more clicks in search results' ),
			__( 'FAQ schema can take up to 50% more space in search results, increasing visibility' ),
			__( "JSON-LD is Google's preferred structured data format" ),
		],
	},
	{
		id: 'aeo-readiness',
		num: '03',
		title: __( 'AEO Readiness' ),
		points: 16,
		summary: __(
			'Answer Engine Optimization. Is the content structured to surface in AI-generated answers? AI tools prioritize pages that answer questions directly, not pages that bury key information.'
		),
		why: __(
			'AI tools pull sentences from web pages to construct answers for users. Content buried in long paragraphs rarely gets cited. Clear, direct answers structured for extraction are far more likely to appear when someone asks an AI to recommend a business like your client.'
		),
		signals: [
			__( 'FAQ section — clear question-and-answer pairs on or linked from the homepage' ),
			__( 'Direct answers — first sentence after each heading answers the implied question' ),
			__( 'Who / what / who content — who they are, what they do, who they serve' ),
			__( 'Featured snippet structure — key facts as clean, extractable sentences' ),
			__( 'FAQ schema applied — machine-readable Q&A markup' ),
			__( 'Question-framed headings — H2s and H3s phrased as questions' ),
		],
		stats: [
			__(
				'ChatGPT reached 100 million users in 2 months — the fastest-growing consumer app in history'
			),
			__(
				'AI-generated answers from ChatGPT, Perplexity, and Google AI Overviews are now the first result many users see'
			),
		],
	},
	{
		id: 'eeat-signals',
		num: '04',
		title: __( 'E-E-A-T Signals' ),
		points: 14,
		summary: __(
			"Experience, Expertise, Authoritativeness, Trustworthiness. Google's quality framework and the backbone of how AI tools evaluate whether a source is worth citing."
		),
		why: __(
			'Claiming expertise is easy. Demonstrating it through specific case outcomes, named clients, certifications, and press coverage is what AI tools treat as credible evidence — and what prospective clients find convincing.'
		),
		signals: [
			__( 'Named team members with roles — not just "our team"' ),
			__(
				'Author credentials — bios citing specific experience, named clients, or certifications'
			),
			__( 'Demonstrated expertise — specifics, not claims' ),
			__( 'External citations or press — publications, podcasts, named award bodies' ),
			__( 'Industry certifications — Google Partner, WooCommerce Expert, and similar' ),
			__( 'Years in business stated — founding year or years of experience' ),
			__( 'About / Team page linked from homepage' ),
		],
		stats: [
			__( "E-E-A-T is a core framework in Google's Search Quality Evaluator Guidelines" ),
			__(
				'Google added the first "E" for Experience in December 2022 — recognizing first-hand knowledge as distinct from expertise'
			),
		],
	},
	{
		id: 'content-freshness',
		num: '05',
		title: __( 'Content Freshness' ),
		points: 12,
		summary: __(
			'Is the content up to date? AI tools and search engines both treat stale content as a signal of lower reliability.'
		),
		why: __(
			'AI tools weight recency when deciding what to cite. A case study from 2019 and a blog post last updated three years ago signal that the business may no longer be active, current, or worth recommending.'
		),
		signals: [
			__( 'Recent blog or content updates — within the last 12 months' ),
			__( 'Case studies with recent dates' ),
			__( 'Dated content — publication or modification dates visible to crawlers' ),
			__( 'sitemap lastmod accuracy — dates reflect actual content changes' ),
			__( 'No outdated references — technology, pricing, team members' ),
		],
		stats: [
			__( 'AI tools weight content recency when selecting sources for generated answers' ),
			__(
				'Accurate lastmod dates in sitemaps tell crawlers which content has changed and is worth re-indexing'
			),
		],
	},
	{
		id: 'entity-clarity',
		num: '06',
		title: __( 'Entity Clarity' ),
		points: 10,
		summary: __(
			'Does the site make it unambiguous who this business is? AI knowledge graphs depend on clear, consistent entity signals across the web.'
		),
		why: __(
			'If AI tools cannot confidently identify who this business is — its name, location, category, and online presence — they will not recommend it. Entity clarity is what gets a business included in AI knowledge graphs.'
		),
		signals: [
			__( 'Business name consistent across homepage, schema, and social profiles' ),
			__( 'Physical location or service area stated' ),
			__( 'Business category clear from homepage copy' ),
			__( 'Social profiles linked from the site (sameAs in schema)' ),
			__( 'NAP consistency — Name, Address, Phone matching across the web' ),
		],
		stats: [
			__(
				'Inconsistent business information across the web confuses AI knowledge graphs and reduces citation likelihood'
			),
		],
	},
	{
		id: 'content-specificity',
		num: '07',
		title: __( 'Content Specificity' ),
		points: 7,
		summary: __(
			'Does the content say something specific, or could it describe any business in the same category? Generic content is the most common reason AI tools skip a site when generating recommendations.'
		),
		why: __(
			'AI tools cite sources that say something distinct and verifiable. Generic descriptions — "we provide excellent service" — carry no information an AI can act on. Specific claims — "we built 47 WooCommerce stores for DTC brands last year" — do.'
		),
		signals: [
			__( 'Specific service descriptions — named deliverables, not generic categories' ),
			__( 'Named client types or industries' ),
			__( 'Quantified outcomes in case studies' ),
			__( 'Process or methodology described specifically' ),
			__( 'Low buzzword density across page copy' ),
		],
		stats: [
			__(
				'Generic descriptions are the most common reason AI tools skip a source when generating recommendations'
			),
		],
	},
	{
		id: 'llms-txt',
		num: '08',
		title: 'llms.txt',
		points: 3,
		summary: __(
			'An emerging standard that lets businesses publish a machine-readable summary of their site specifically for large language models.'
		),
		why: __(
			'llms.txt is to AI tools what robots.txt was to search engines — a direct, structured way to tell them what the site is about and what it wants them to know. Still early, but adoption is growing fast.'
		),
		signals: [
			__( 'llms.txt file present at /llms.txt' ),
			__( 'File content includes business name, description, services, and key URLs' ),
			__( 'llms-full.txt optionally present for extended AI context' ),
		],
		stats: [
			__(
				'llms.txt is an emerging standard giving AI tools a structured, curated summary of site content'
			),
			__( 'Adoption is growing as AI search becomes a primary discovery channel for businesses' ),
		],
	},
];

export default function AmplifyAiSection() {
	return (
		<div className="amplify-criteria-section is-ai">
			<div className="amplify-criteria-section-header">
				<p className="amplify-criteria-eyebrow">{ __( 'AI analysis' ) }</p>
				<h2 className="amplify-criteria-title">{ __( 'Get found when buyers use AI' ) }</h2>
				<p className="amplify-criteria-intro">
					{ __(
						"ChatGPT reached 100 million users in two months. Perplexity now fields tens of millions of searches a day. Google AI Overviews appear above organic results for hundreds of millions of queries. When your clients' customers search for products or services using AI, your clients' sites need to be readable, structured, and citable. Most aren't, and most agencies haven't checked."
					) }
				</p>

				{ /* ── 3 HERO STATS ── */ }
				<div className="amplify-criteria-stats">
					<div className="amplify-criteria-stat">
						<span className="amplify-criteria-stat-num">100M</span>
						<span className="amplify-criteria-stat-label">
							{ __( 'ChatGPT users in just 2 months' ) }
						</span>
					</div>
					<div className="amplify-criteria-stat">
						<span className="amplify-criteria-stat-num">20–30%</span>
						<span className="amplify-criteria-stat-label">
							{ __( 'More clicks with structured data' ) }
						</span>
					</div>
					<div className="amplify-criteria-stat">
						<span className="amplify-criteria-stat-num">0</span>
						<span className="amplify-criteria-stat-label">
							{ __( 'Visibility for sites that block AI crawlers' ) }
						</span>
					</div>
				</div>
			</div>

			{ /* ── CRITERIA CARDS ── */ }
			<div className="amplify-criteria-cards">
				{ CRITERIA.map( ( c ) => (
					<div key={ c.id } className="amplify-criteria-card">
						<span className="amplify-criteria-card-num">{ c.num }</span>
						<h3 className="amplify-criteria-card-title">{ c.title }</h3>
						<p className="amplify-criteria-card-summary">{ c.summary }</p>
					</div>
				) ) }
			</div>
		</div>
	);
}
