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
		id: 'trust-signals',
		num: '01',
		title: __( 'Trust Signals' ),
		points: 18,
		summary: __(
			'Does the site give a prospective client enough evidence to feel safe handing over a project?'
		),
		why: __(
			'Trust is the gate before every conversion. No amount of good design overcomes a site that fails to prove the agency is real, credible, and experienced.'
		),
		signals: [
			__( 'Testimonials — attributed, with name, company, and photo' ),
			__( 'Case studies with quantified outcomes' ),
			__( 'Client logos from recognizable brands' ),
			__( 'Results and metrics ("increased conversions by 40%")' ),
			__( 'Social proof volume — 5+ reviews' ),
			__( 'Awards and third-party recognition' ),
			__( 'Team or About page presence' ),
			__( 'Years in business or client count' ),
		],
		stats: [
			__( '72% of consumers find testimonials more credible than brand claims' ),
			__( 'Testimonials drive a 34% increase in conversions on sales pages' ),
			__( '5+ reviews makes a service 270% more likely to convert' ),
		],
	},
	{
		id: 'contact-conversion',
		num: '02',
		title: __( 'Contact & Conversion' ),
		points: 15,
		summary: __(
			'A prospective client is ready to reach out. Does the site make that easy, or create friction at the worst possible moment?'
		),
		why: __(
			'The best-designed site in the world loses business if a motivated prospect cannot figure out how to contact the agency in under ten seconds.'
		),
		signals: [
			__( 'Primary CTA visible above the fold' ),
			__( 'Form field count — 4 or fewer for maximum conversion' ),
			__( 'Contact information present and findable' ),
			__( 'CTA repeated near the bottom of the page' ),
			__( 'CTA copy clarity — specific and action-oriented' ),
			__( 'Response time promise near the contact form' ),
		],
		stats: [
			__( 'Above-fold CTAs outperform below-fold by 304%' ),
			__( 'Action-oriented CTAs convert 121% more than passive ones' ),
			__( 'Reducing a form from 11 to 4 fields increases conversions by 120%' ),
		],
	},
	{
		id: 'seo',
		num: '03',
		title: __( 'SEO' ),
		points: 13,
		summary: __(
			'Can a prospective client find this site when they search? All signals are sourced from Google Search Central documentation.'
		),
		why: __(
			'Discoverability is the prerequisite for everything else. A site no one can find cannot convert anyone.'
		),
		signals: [
			__( 'H1 present and heading hierarchy logical' ),
			__( 'Title tag — unique, under 60 characters, keyword-relevant' ),
			__( 'Meta description — present, under 160 characters' ),
			__( 'Image alt text on all meaningful images' ),
			__( 'robots.txt — not blocking crawlers' ),
			__( 'Canonical tag — self-referencing' ),
			__( 'Structured data present on the homepage' ),
			__( 'No intrusive interstitials on mobile' ),
		],
		stats: [
			__( 'A misconfigured robots.txt can silently remove a site from all search results' ),
			__( 'Missing alt text means crawlers see blank spaces where your best content should be' ),
		],
	},
	{
		id: 'mobile-experience',
		num: '04',
		title: __( 'Mobile Experience' ),
		points: 13,
		summary: __(
			'A first impression increasingly happens on a phone. Does the site hold up when a prospective client pulls it up on their device?'
		),
		why: __(
			'More than 62% of web traffic is mobile. A site that breaks on a phone is a site that loses the majority of its visitors before they form any opinion at all.'
		),
		signals: [
			__( 'Touch targets — minimum 48×48px with 8px spacing' ),
			__( 'Body font size — 16px minimum (below this, iOS Safari auto-zooms)' ),
			__( 'No horizontal overflow or forced scrolling' ),
			__( 'Responsive breakpoints present in CSS' ),
			__( 'No intrusive interstitials covering content on mobile' ),
			__( 'Navigation collapses usably on small screens' ),
			__( 'Content legibility at mobile viewport' ),
		],
		stats: [
			__( 'Mobile accounts for 62 to 64% of global web traffic as of 2026' ),
			__( 'Google penalizes intrusive interstitials in mobile rankings' ),
		],
	},
	{
		id: 'content-quality',
		num: '05',
		title: __( 'Content Quality' ),
		points: 12,
		summary: __(
			'Is the writing compelling, clear, and professional? Errors and poor readability erode trust before a client has read a single sentence.'
		),
		why: __(
			"Copy errors are trust killers. Before a prospective client evaluates the agency's work, they read the agency's words. Mistakes in those words signal carelessness in everything else."
		),
		signals: [
			__( 'Flesch Reading Ease score — 60 to 70 target (8th to 9th grade)' ),
			__( 'Sentence and paragraph length — scannable, not walls of text' ),
			__( 'Grammar and spelling — AI-checked for visible errors' ),
			__( 'Sufficient content volume for context' ),
			__( 'Heading usage for scannability' ),
			__( 'Low passive voice density' ),
			__( 'Low buzzword and jargon density' ),
		],
		stats: [
			__( '97.2% of people say grammar influences their perception of a company' ),
			__( '59% of consumers are less likely to trust a brand with copy errors' ),
			__( 'Pages with spelling errors have 85% higher bounce rates' ),
		],
	},
	{
		id: 'design-experience',
		num: '06',
		title: __( 'Design & Experience' ),
		points: 11,
		summary: __(
			'Does the site look credible and feel effortless to use? All signals are grounded in the Laws of UX.'
		),
		why: __(
			'Visual polish builds immediate trust and is perceived as more capable, even before a word is read. Low visual quality is often the unconscious reason a visitor bounces within the first five seconds.'
		),
		signals: [
			__( "Hick's Law — nav item count and choice overload" ),
			__( "Fitts's Law — CTA button size and tap target spacing" ),
			__( "Jakob's Law — standard pattern conformance (logo, nav, footer)" ),
			__( 'Serial Position Effect — key content placement first and last' ),
			__( 'Aesthetic-Usability Effect — overall visual polish from screenshot' ),
			__( 'Von Restorff Effect — primary CTA visually differentiated' ),
			__( 'Peak-End Rule — hero quality and final CTA evaluation' ),
			__( 'Gestalt Laws — layout grouping and visual clarity' ),
		],
		stats: [
			__( '75% of consumers judge credibility based on website design alone' ),
			__( 'First impressions form in as little as 50 milliseconds' ),
		],
	},
	{
		id: 'accessibility',
		num: '07',
		title: __( 'Accessibility' ),
		points: 10,
		summary: __(
			'Does the site work for everyone? Amplify measures against WCAG AA, the standard referenced by courts and regulators globally.'
		),
		why: __(
			'Accessibility is not a nice-to-have. It is a legal standard in most jurisdictions, and a signal to search engines and AI tools that the site was built with care.'
		),
		signals: [
			__( 'Image alt text — WCAG 1.1.1' ),
			__( 'Color contrast ratio — 4.5:1 minimum — WCAG 1.4.3' ),
			__( 'Form labels on all input fields — WCAG 1.3.1' ),
			__( 'Language attribute on <html> — WCAG 3.1.1' ),
			__( 'Skip navigation link — WCAG 2.4.1' ),
			__( 'No auto-playing media — WCAG 1.4.2' ),
			__( 'Heading levels not skipped — WCAG 1.3.1' ),
			__( 'Focus indicators on interactive elements — WCAG 2.4.7' ),
		],
		stats: [
			__(
				'WCAG AA is the legal accessibility standard across the EU, UK, US, Canada, and Australia'
			),
		],
	},
	{
		id: 'audience-resonance',
		num: '08',
		title: __( 'Audience Resonance' ),
		points: 8,
		summary: __(
			'Does the site feel made for the right client? Within seconds of landing, a prospective client should feel the site is speaking directly to them.'
		),
		why: __(
			'Generic copy describes every agency equally, which differentiates none of them. Specific messaging creates the "that\'s me" feeling that generic copy cannot replicate. That feeling is what turns a browse into an enquiry.'
		),
		signals: [
			__(
				'5-second clarity test — what does this agency do, who do they serve, why should I care?'
			),
			__( 'Audience specificity — a specific type of client, industry, or pain point' ),
			__( 'Pain point language — in the words real clients would use' ),
			__( 'Generic claim detection — "results-driven," "passionate," "full-service"' ),
			__( 'Hero headline clarity — value proposition in the H1' ),
			__( 'Above-fold content presence — text visible without scrolling' ),
		],
		stats: [
			__( 'Specific, targeted messaging converts 202% better than generic copy' ),
			__( 'Only 13% of customers feel brands truly understand their needs' ),
			__( 'Users give a homepage 3 to 5 seconds to earn their trust' ),
		],
	},
];

export default function AmplifyHumanSection() {
	return (
		<div className="amplify-criteria-section">
			<div className="amplify-criteria-section-header">
				<p className="amplify-criteria-eyebrow">{ __( 'Human-centric analysis' ) }</p>
				<h2 className="amplify-criteria-title">{ __( 'See what prospective clients see' ) }</h2>
				<p className="amplify-criteria-intro">
					{ __(
						"When someone lands on your client's site, they form an impression in under a second. They scan for trust. They look for contact information. They decide, in 3 to 5 seconds, whether this business is worth their time. Amplify measures all of it across eight criteria, then tells you exactly what to fix and why. This is the analysis that separates agencies who deliver beautiful sites from agencies who deliver sites that actually win business."
					) }
				</p>

				{ /* ── 3 HERO STATS ── */ }
				<div className="amplify-criteria-stats">
					<div className="amplify-criteria-stat">
						<span className="amplify-criteria-stat-num">50ms</span>
						<span className="amplify-criteria-stat-label">
							{ __( 'Time it takes to form a first impression' ) }
						</span>
					</div>
					<div className="amplify-criteria-stat">
						<span className="amplify-criteria-stat-num">75%</span>
						<span className="amplify-criteria-stat-label">
							{ __( 'Of consumers judge credibility by design alone' ) }
						</span>
					</div>
					<div className="amplify-criteria-stat">
						<span className="amplify-criteria-stat-num">34%</span>
						<span className="amplify-criteria-stat-label">
							{ __( 'Average conversion lift from testimonials on sales pages' ) }
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
