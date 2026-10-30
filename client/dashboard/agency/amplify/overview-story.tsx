import { ExternalLink, __experimentalHeading as Heading } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { useEffect, useRef, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useTermTooltip } from '../components/term-tooltip';
import { getReportTiming, getTierAllowances } from './constants';
import { SAMPLE_REPORT_URL } from './sample-report-pages';
import { PERSPECTIVES } from './score-preview';
import { severityFor } from './score-severity';

// TODO: replace with the knowledge base articles once they're published.
const KB_URLS: Record< 'human' | 'ai', string > = {
	human: 'https://agencieshelp.automattic.com/knowledge-base/',
	ai: 'https://agencieshelp.automattic.com/knowledge-base/',
};

const FAQS = [
	{
		id: 'site-requirements',
		question: __( 'What does a site need to be audited?' ),
		answer: __(
			'Just a public homepage. It works on any platform, WordPress or not, and you don’t need to connect the site or sign in. The audit looks at the page’s visible design and front-end code.'
		),
	},
	{
		id: 'timing',
		question: __( 'How long does a report take?' ),
		answer: sprintf(
			/* translators: %s: how long a report takes, e.g. "10 to 20 minutes" */
			__(
				'Most reports are ready in %s. You can leave the page while it runs, and the report appears in your list when it’s done.'
			),
			getReportTiming()
		),
	},
	{
		id: 'limits',
		question: __( 'How many reports can I create?' ),
		answer: sprintf(
			/* translators: 1: monthly reports for Account Activated, 2: for Agency Partner, 3: for Pro Agency Partner, 4: for VIP Pro & Premier */
			__(
				'It depends on your agency tier: %1$d reports a month for Account Activated, %2$d for Agency Partner, %3$d for Pro Agency Partner, and %4$d for VIP Pro & Premier. Your allowance resets on the 1st of every month, and Agency Partners and above can ask for more.'
			),
			...( getTierAllowances().map( ( tier ) => tier.scans ) as [ number, number, number, number ] )
		),
	},
	{
		id: 'homepage-only',
		question: __( 'Does the audit cover the whole site?' ),
		answer: __(
			'Not yet. Each audit looks at a public homepage, where many visitors and AI tools first encounter a business. The report is a point-in-time view, not a full-site audit.'
		),
	},
	{
		id: 'using-scores',
		question: __( 'How should I use the scores?' ),
		answer: __(
			'Treat them as directional signals, not a final verdict. Use the category scores and individual findings to start a conversation about what is working, what needs attention, and what to improve first.'
		),
	},
	{
		id: 'own-pitch',
		question: __( 'Can I turn the report into my own pitch?' ),
		answer: __(
			'Yes. Feed the PDF into your AI tool of choice to create a branded report or pitch deck in your agency’s voice. Review the result against the site before you share it.'
		),
	},
	{
		id: 'share-with-prospect',
		question: __( 'Can I share a report with a prospect?' ),
		answer: __(
			'Yes. Download the completed report as a PDF to send ahead of a pitch or walk through together.'
		),
	},
	{
		id: 'report-updates',
		question: __( 'Will a report update after the homepage changes?' ),
		answer: __(
			'No. Each report captures the public homepage at the time of the audit. Run another audit after making changes to see an updated assessment.'
		),
	},
];

const SAMPLE_CATEGORY = { score: 8.5, max: 17 };

// “8.5/17” in Knockout, the report's numeral face, traced to outlines so the font isn't shipped.
const SAMPLE_CATEGORY_SCORE_PATH =
	'M266 547V415C266 375 251 346 225 331C251 315 266 286 266 247V119C266 44 219 -10 146 -10C74 -10 26 44 26 119V247C26 286 41 315 67 331C41 346 26 375 26 415V547C26 623 74 676 146 676C219 676 266 623 266 547ZM172 271C172 286 161 297 146 297C131 297 120 286 120 271V117C120 101 131 90 146 90C161 90 172 101 172 117ZM172 549C172 565 161 576 146 576C131 576 120 565 120 549V390C120 374 131 364 146 364C161 364 172 374 172 390Z M391 666V549H312V666Z M667 0H451L438 332L525 341C525 329 537 318 548 318C559 318 571 329 571 343V549C571 565 561 576 546 576C531 576 520 565 520 546V476H432V550C432 614 471 676 544 676C616 676 665 623 665 547V324C665 272 636 235 592 235C564 235 541 246 525 265L532 97H613C646 97 665 70 667 0Z M901 -63H846L673 730H728Z M1038 666V0H983C983 22 972 42 941 42V666Z M1340 42V0H1104V102H1245C1196 233 1142 450 1127 666H1233C1242 429 1278 242 1340 42Z';

/** A category from the sample report: score, what's working and what to improve. */
function CategoryGraphic() {
	const ref = useRef< HTMLDivElement >( null );
	const [ isVisible, setIsVisible ] = useState( false );
	const { score, max } = SAMPLE_CATEGORY;

	useEffect( () => {
		const element = ref.current;
		if ( ! element || typeof IntersectionObserver === 'undefined' ) {
			setIsVisible( true );
			return;
		}
		const observer = new IntersectionObserver(
			( [ entry ] ) => {
				if ( entry.isIntersecting ) {
					setIsVisible( true );
					observer.disconnect();
				}
			},
			{ threshold: 0.4 }
		);
		observer.observe( element );
		return () => observer.disconnect();
	}, [] );

	return (
		<div
			ref={ ref }
			className="dashboard-amplify-story__category-card"
			data-visible={ isVisible }
			aria-hidden="true"
		>
			<div
				className="dashboard-amplify-story__category-card-score"
				data-severity={ severityFor( score, max ) }
			>
				<svg viewBox="0 -12 1348 690" focusable="false">
					<path d={ SAMPLE_CATEGORY_SCORE_PATH } />
				</svg>
				<span>
					<i style={ { width: `${ ( score / max ) * 100 }%` } } />
				</span>
			</div>
			<span className="dashboard-amplify-story__category-card-heading">
				{ __( 'What’s working' ) }
			</span>
			<ol>
				<li>{ __( 'The address and opening days are easy to find in the footer.' ) }</li>
			</ol>
			<span className="dashboard-amplify-story__category-card-heading">
				{ __( 'What to improve' ) }
			</span>
			<ol>
				<li>{ __( 'Visitors scroll past three photos before they can book.' ) }</li>
				<li>{ __( 'The only button says “Learn more”.' ) }</li>
				<li>{ __( 'Nothing says how quickly private-dining enquiries are answered.' ) }</li>
			</ol>
		</div>
	);
}

// The sample report's score summary, in the same order as `PERSPECTIVES` metrics.
const SAMPLE_REPORT_SCORES = {
	human: [ 7, 8.5, 7.5, 9, 10, 7.5, 7, 3 ],
	ai: [ 15, 5, 6, 5, 6, 7.5, 6, 0 ],
};

function SamplePageHeader() {
	return (
		<div className="dashboard-amplify-story__page-header">
			<span>
				AUTOMATTIC
				<br />
				FOR AGENCIES
			</span>
			<span>oliveandember.example</span>
		</div>
	);
}

function SampleRing( { value }: { value: number } ) {
	return (
		<svg className="dashboard-amplify-story__page-ring" viewBox="0 0 36 36" focusable="false">
			<circle cx="18" cy="18" r="15.9" pathLength="100" />
			<circle cx="18" cy="18" r="15.9" pathLength="100" strokeDasharray={ `${ value } 100` } />
			<text x="18" y="22.5" textAnchor="middle">
				{ value }
				<tspan>%</tspan>
			</text>
		</svg>
	);
}

/** The sample report's first pages, rebuilt in HTML and fanned out; opens the full sample. */
function ReportPagesGraphic( { onOpen }: { onOpen: () => void } ) {
	return (
		<a
			className="dashboard-amplify-story__pages"
			href={ SAMPLE_REPORT_URL }
			target="_blank"
			rel="noopener noreferrer"
			onClick={ onOpen }
			aria-label={ __( 'View a sample report (opens in a new tab)' ) }
		>
			<div className="dashboard-amplify-story__page" data-page="cover" aria-hidden="true">
				<div className="dashboard-amplify-story__page-cover">
					<span className="dashboard-amplify-story__page-logo">
						AUTOMATTIC
						<br />
						FOR AGENCIES
					</span>
					<span className="dashboard-amplify-story__page-site">Olive &amp; Ember</span>
					<span className="dashboard-amplify-story__page-title">
						{ __( 'A closer look at your homepage' ) }
					</span>
					<span className="dashboard-amplify-story__page-lede">
						{ __(
							'A detailed look at what you can improve for first-time visitors and AI systems.'
						) }
					</span>
				</div>
				<svg className="dashboard-amplify-story__page-art" viewBox="0 0 1000 545" focusable="false">
					<path d="M85 272Q273 75 461 272Q273 469 85 272Z" />
					<circle cx="273" cy="272" r="73" />
					<rect x="538" y="83" width="376" height="377" />
					<rect x="569" y="116" width="314" height="313" />
					<rect x="611" y="157" width="230" height="230" />
					<rect x="650" y="196" width="152" height="152" />
				</svg>
			</div>
			<div className="dashboard-amplify-story__page" aria-hidden="true">
				<SamplePageHeader />
				<span className="dashboard-amplify-story__page-eyebrow">
					{ __( 'Overall assessment' ) }
				</span>
				<span className="dashboard-amplify-story__page-title">
					{ __( 'Your homepage at a glance' ) }
				</span>
				{ [
					{ value: 60, label: __( 'First-time visitors' ) },
					{ value: 51, label: __( 'AI systems' ) },
				].map( ( { value, label } ) => (
					<div key={ label } className="dashboard-amplify-story__page-perspective">
						<SampleRing value={ value } />
						<span>
							<b>{ label }</b>
							<i>{ __( 'Needs Work' ) }</i>
						</span>
					</div>
				) ) }
				<b className="dashboard-amplify-story__page-heading">{ __( 'What’s working' ) }</b>
				<span className="dashboard-amplify-story__page-lines" />
				<b className="dashboard-amplify-story__page-heading">{ __( 'What to improve' ) }</b>
				<span className="dashboard-amplify-story__page-lines" />
			</div>
			<div className="dashboard-amplify-story__page" aria-hidden="true">
				<SamplePageHeader />
				<span className="dashboard-amplify-story__page-eyebrow">{ __( 'Score summary' ) }</span>
				<span className="dashboard-amplify-story__page-title">
					{ __( 'How your page performed' ) }
				</span>
				<div className="dashboard-amplify-story__page-scores">
					{ ( [ 'human', 'ai' ] as const ).map( ( type ) => (
						<div key={ type }>
							{ PERSPECTIVES[ type ].metrics.map( ( metric, index ) => {
								const score = SAMPLE_REPORT_SCORES[ type ][ index ];
								return (
									<div
										key={ metric.label }
										className="dashboard-amplify-story__page-score"
										data-severity={ severityFor( score, metric.max ) }
									>
										<span>{ metric.label }</span>
										<b>{ `${ score }/${ metric.max }` }</b>
										<em>
											<i style={ { width: `${ ( score / metric.max ) * 100 }%` } } />
										</em>
									</div>
								);
							} ) }
						</div>
					) ) }
				</div>
			</div>
		</a>
	);
}

/** The same report, run on three kinds of homepage. */
function AudiencesGraphic() {
	const sites = [
		{ kind: 'prospect', label: __( 'Prospect' ), url: 'oliveandember.example', score: 43 },
		{ kind: 'client', label: __( 'Client' ), url: 'brightsmile.example', score: 71 },
		{ kind: 'agency', label: __( 'Your agency' ), url: 'youragency.example', score: 88 },
	];
	return (
		<div className="dashboard-amplify-story__audiences" aria-hidden="true">
			{ sites.map( ( site ) => (
				<div
					key={ site.kind }
					className="dashboard-amplify-story__audience"
					data-kind={ site.kind }
				>
					<div className="dashboard-amplify-story__audience-bar">
						<i />
						<i />
						<i />
						<span>{ site.url }</span>
					</div>
					<div className="dashboard-amplify-story__audience-body">
						<span className="dashboard-amplify-story__audience-label">{ site.label }</span>
						<Badge intent={ getScoreIntent( site.score ) }>{ `${ site.score }/100` }</Badge>
					</div>
					<div className="dashboard-amplify-story__audience-lines">
						<i />
						<i />
						<i />
					</div>
				</div>
			) ) }
		</div>
	);
}

function getScoreIntent( score: number ) {
	if ( score >= 80 ) {
		return 'stable';
	}
	return score >= 50 ? 'medium' : 'high';
}

function PromptGraphic() {
	return (
		<div className="dashboard-amplify-story__prompt" aria-hidden="true">
			<p>
				<span>
					{ __(
						'Turn this report into a 5-slide pitch deck in our agency’s voice, leading with the three biggest gaps.'
					) }
				</span>
				<span className="dashboard-amplify-story__prompt-caret" />
			</p>
			<div className="dashboard-amplify-story__prompt-actions">
				<span className="dashboard-amplify-story__prompt-attachment">
					<span className="dashboard-amplify-story__prompt-file">{ __( 'PDF' ) }</span>
					<span>prospect-report.pdf</span>
				</span>
				<span className="dashboard-amplify-story__prompt-send">↑</span>
			</div>
		</div>
	);
}

function RubricItem( {
	label,
	description,
	max,
}: {
	label: string;
	description: string;
	max: number;
} ) {
	const { triggerProps, tooltip, isOpen } = useTermTooltip< HTMLButtonElement >( description );
	/* translators: %d: maximum points available in a report category. */
	const maxPointsLabel = sprintf( __( '%d pts' ), max );
	return (
		<div className="dashboard-amplify-story__rubric-item" data-active={ isOpen }>
			<button type="button" { ...triggerProps }>
				<span>{ label }</span>
				<strong>{ maxPointsLabel }</strong>
			</button>
			{ tooltip }
		</div>
	);
}

function ScoreCategories() {
	const { recordTracksEvent } = useAnalytics();

	return (
		<section className="dashboard-amplify-story__rubric" aria-labelledby="amplify-rubric-title">
			<Heading id="amplify-rubric-title" level={ 2 }>
				{ __( 'What each score looks for' ) }
			</Heading>
			<p className="dashboard-amplify-story__rubric-intro">
				{ __(
					'Each lens looks at eight categories. Together, they show where a homepage is doing well and where it needs improvements.'
				) }
			</p>
			<div className="dashboard-amplify-story__rubric-columns">
				{ ( [ 'human', 'ai' ] as const ).map( ( type ) => (
					<section
						className="dashboard-amplify-story__rubric-perspective"
						key={ type }
						aria-labelledby={ `amplify-rubric-${ type }` }
					>
						<Heading id={ `amplify-rubric-${ type }` } level={ 3 }>
							{ PERSPECTIVES[ type ].title }
						</Heading>
						<p>
							<span>
								{ type === 'human'
									? __( 'Whether a first-time visitor trusts the business enough to get in touch.' )
									: __(
											'Whether AI tools can read the site, understand the business, and recommend it.'
										) }
							</span>{ ' ' }
							<ExternalLink
								href={ KB_URLS[ type ] }
								onClick={ () =>
									recordTracksEvent( 'calypso_a4a_amplify_rubric_kb_click', { lens: type } )
								}
							>
								{ __( 'Learn more' ) }
							</ExternalLink>
						</p>
						<div className="dashboard-amplify-story__rubric-grid">
							{ PERSPECTIVES[ type ].metrics.map( ( metric ) => (
								<RubricItem
									key={ metric.label }
									label={ metric.label }
									description={ metric.description }
									max={ metric.max }
								/>
							) ) }
						</div>
					</section>
				) ) }
			</div>
		</section>
	);
}

export default function AmplifyOverviewStory() {
	const { recordTracksEvent } = useAnalytics();
	return (
		<div className="dashboard-amplify-story">
			<section
				className="dashboard-amplify-story__section"
				aria-labelledby="amplify-categories-title"
			>
				<div className="dashboard-amplify-story__graphic">
					<ReportPagesGraphic
						onOpen={ () => {
							recordTracksEvent( 'calypso_a4a_amplify_sample_report_open', {
								source: 'story-graphic',
							} );
						} }
					/>
				</div>
				<div className="dashboard-amplify-story__copy">
					<Heading id="amplify-categories-title" level={ 2 }>
						{ __( 'What’s in the report' ) }
					</Heading>
					<p>
						{ __(
							'A detailed PDF of everything holding the site back. Bring prospects proof of the problems, and a clear plan for how you’ll fix them once they hire you.'
						) }
					</p>
					<ExternalLink
						className="dashboard-amplify-story__sample-link"
						href={ SAMPLE_REPORT_URL }
						onClick={ () =>
							recordTracksEvent( 'calypso_a4a_amplify_sample_report_open', { source: 'story' } )
						}
					>
						{ __( 'View a sample report' ) }
					</ExternalLink>
				</div>
			</section>

			<section
				className="dashboard-amplify-story__section"
				aria-labelledby="amplify-perspectives-title"
			>
				<div className="dashboard-amplify-story__graphic">
					<CategoryGraphic />
				</div>
				<div className="dashboard-amplify-story__copy">
					<Heading id="amplify-perspectives-title" level={ 2 }>
						{ __( 'Specific findings you can pitch' ) }
					</Heading>
					<p>
						{ __(
							'Each finding names the problem, explains why it costs the business customers, and shows how to fix it. You walk into the pitch with specifics, not opinions.'
						) }
					</p>
				</div>
			</section>

			<section className="dashboard-amplify-story__section" aria-labelledby="amplify-prompts-title">
				<div className="dashboard-amplify-story__graphic">
					<PromptGraphic />
				</div>
				<div className="dashboard-amplify-story__copy">
					<Heading id="amplify-prompts-title" level={ 2 }>
						{ __( 'Turn it into your pitch' ) }
					</Heading>
					<p>
						{ __(
							'Feed the PDF into your AI tool of choice to turn it into a branded report or pitch deck in your agency’s voice.'
						) }
					</p>
				</div>
			</section>

			<section
				className="dashboard-amplify-story__section"
				aria-labelledby="amplify-audiences-title"
			>
				<div className="dashboard-amplify-story__graphic">
					<AudiencesGraphic />
				</div>
				<div className="dashboard-amplify-story__copy">
					<Heading id="amplify-audiences-title" level={ 2 }>
						{ __( 'Not just for new clients' ) }
					</Heading>
					<p>
						{ __(
							'Run one on a current client’s site to plan their next round of work, or on your own homepage to see it the way prospects do.'
						) }
					</p>
				</div>
			</section>

			<ScoreCategories />

			<section className="dashboard-amplify-story__faq" aria-labelledby="amplify-faq-title">
				<Heading id="amplify-faq-title" level={ 2 }>
					{ __( 'Frequently asked questions' ) }
				</Heading>
				<p className="dashboard-amplify-story__faq-intro">
					{ __( 'A few things to know before you create or share a report.' ) }
				</p>
				<div className="dashboard-amplify-story__faq-list">
					{ FAQS.map( ( faq ) => (
						<div className="dashboard-amplify-story__faq-item" key={ faq.id }>
							<Heading level={ 3 }>{ faq.question }</Heading>
							<p>{ faq.answer }</p>
						</div>
					) ) }
				</div>
			</section>
		</div>
	);
}
