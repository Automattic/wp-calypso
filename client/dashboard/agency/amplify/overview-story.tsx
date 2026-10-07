import { Button, Panel, PanelBody, __experimentalHeading as Heading } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import InlineSupportLink from '../../components/inline-support-link';
import AmplifyAlsoUseful from './also-useful';
import { getSampleFindings, getSampleLenses, getSeverityLabel } from './sample-report-data';
import AmplifySampleReportModal from './sample-report-modal';
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

/** The sample report's top Critical finding, shown as a finding card. */
function FindingGraphic() {
	const finding = getSampleFindings()[ 0 ];
	const lens = getSampleLenses().find( ( item ) => item.key === finding.lens );
	return (
		<div className="dashboard-amplify-story__finding" aria-hidden="true">
			<span className="dashboard-amplify-story__finding-severity">
				{ getSeverityLabel( finding.severity ) }
			</span>
			<span className="dashboard-amplify-story__finding-meta">
				{ lens?.label } · { finding.category }
			</span>
			<strong>{ finding.title }</strong>
			<p>{ finding.detail }</p>
			<p>
				<b>{ __( 'Why it matters:' ) }</b> { finding.impact }
			</p>
			<p className="dashboard-amplify-story__finding-improve">
				<b>{ __( 'How to improve:' ) }</b> { finding.improve }
			</p>
		</div>
	);
}

function CategoriesGraphic() {
	return (
		<div className="dashboard-amplify-story__categories" aria-hidden="true">
			<span>{ __( 'Category breakdown' ) }</span>
			{ [
				{ label: __( 'Trust signals' ), score: 9, max: 18 },
				{ label: __( 'Mobile experience' ), score: 8, max: 12 },
				{ label: __( 'Content quality' ), score: 9, max: 12 },
			].map( ( item ) => (
				<div className="dashboard-amplify-story__category" key={ item.label }>
					<span>{ item.label }</span>
					<div>
						<i
							data-severity={ severityFor( item.score, item.max ) }
							style={ { width: `${ ( item.score / item.max ) * 100 }%` } }
						/>
					</div>
					<strong>
						{ item.score }/{ item.max }
					</strong>
				</div>
			) ) }
		</div>
	);
}

function PromptGraphic() {
	return (
		<div className="dashboard-amplify-story__prompt" aria-hidden="true">
			<p>
				{ __(
					'Turn this report into a 5-slide pitch deck in our agency’s voice, leading with the three biggest gaps.'
				) }
				<span className="dashboard-amplify-story__prompt-caret" />
			</p>
			<div className="dashboard-amplify-story__prompt-actions">
				<span>+</span>
				<span className="dashboard-amplify-story__prompt-send">↑</span>
			</div>
		</div>
	);
}

function ScoreCategories() {
	const { recordTracksEvent } = useAnalytics();
	const [ previewedCategory, setPreviewedCategory ] = useState< string | null >( null );
	const [ selectedCategory, setSelectedCategory ] = useState< string | null >( null );
	const [ tooltipContent, setTooltipContent ] = useState( '' );
	const [ tooltipPosition, setTooltipPosition ] = useState( { x: 0, y: 0 } );
	const gridRef = useRef< HTMLDivElement >( null );
	const rubricRef = useRef< HTMLElement >( null );
	const tooltipRef = useRef< HTMLDivElement >( null );
	const activeCategory = previewedCategory ?? selectedCategory;

	const positionTooltip = ( clientX: number, clientY: number ) => {
		const rubric = rubricRef.current?.getBoundingClientRect();
		if ( ! rubric ) {
			return;
		}
		const tooltipWidth = tooltipRef.current?.offsetWidth ?? 300;
		const tooltipHeight = tooltipRef.current?.offsetHeight ?? 120;
		const rightEdge = Math.min( rubric.right, window.innerWidth - 12 );
		const left =
			clientX + 16 + tooltipWidth <= rightEdge ? clientX + 16 : clientX - tooltipWidth - 16;
		const top =
			clientY + 16 + tooltipHeight <= window.innerHeight - 12
				? clientY + 16
				: clientY - tooltipHeight - 16;
		setTooltipPosition( {
			x: Math.max( 12, left ) - rubric.left,
			y: top - rubric.top,
		} );
	};

	useEffect( () => {
		const dismissOnOutsideClick = ( event: PointerEvent ) => {
			if ( ! gridRef.current?.contains( event.target as Node ) ) {
				setSelectedCategory( null );
			}
		};
		const dismissOnEscape = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' ) {
				setSelectedCategory( null );
				setPreviewedCategory( null );
			}
		};
		document.addEventListener( 'pointerdown', dismissOnOutsideClick );
		document.addEventListener( 'keydown', dismissOnEscape );
		return () => {
			document.removeEventListener( 'pointerdown', dismissOnOutsideClick );
			document.removeEventListener( 'keydown', dismissOnEscape );
		};
	}, [] );

	return (
		<section
			className="dashboard-amplify-story__rubric"
			aria-labelledby="amplify-rubric-title"
			ref={ rubricRef }
		>
			<Heading id="amplify-rubric-title" level={ 2 }>
				{ __( 'What each score looks for' ) }
			</Heading>
			<p className="dashboard-amplify-story__rubric-intro">
				{ __(
					'Each lens looks at eight categories. Together, they show where a homepage is doing well and where it needs improvements.'
				) }
			</p>
			<div className="dashboard-amplify-story__rubric-columns" ref={ gridRef }>
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
									? __( 'People: trust, clarity, and what builds confidence.' )
									: __( 'AI agents: how ChatGPT, Perplexity, and others read and rank the site.' ) }
							</span>{ ' ' }
							<InlineSupportLink
								supportLink={ KB_URLS[ type ] }
								forceOpenInHelpCenter
								onClick={ () =>
									recordTracksEvent( 'calypso_a4a_amplify_rubric_kb_click', { lens: type } )
								}
							>
								{ type === 'human'
									? __( 'See everything the people audit covers' )
									: __( 'See everything the AI audit covers' ) }
							</InlineSupportLink>
						</p>
						<div className="dashboard-amplify-story__rubric-grid">
							{ PERSPECTIVES[ type ].metrics.map( ( metric, index ) => {
								const category = `${ type }-${ index }`;
								const isActive = activeCategory === category;
								/* translators: %d: maximum points available in a report category. */
								const maxPointsLabel = sprintf( __( '%d pts' ), metric.max );
								return (
									<div
										className="dashboard-amplify-story__rubric-item"
										data-active={ isActive }
										key={ category }
									>
										<button
											type="button"
											aria-expanded={ isActive }
											aria-describedby={ isActive ? 'amplify-rubric-tooltip' : undefined }
											onPointerEnter={ ( event ) => {
												setTooltipContent( metric.description );
												setPreviewedCategory( category );
												positionTooltip( event.clientX, event.clientY );
											} }
											onPointerMove={ ( event ) => positionTooltip( event.clientX, event.clientY ) }
											onPointerLeave={ () => setPreviewedCategory( null ) }
											onFocus={ ( event ) => {
												setTooltipContent( metric.description );
												setPreviewedCategory( category );
												const rect = event.currentTarget.getBoundingClientRect();
												positionTooltip( rect.left + rect.width / 2, rect.bottom );
											} }
											onBlur={ () => setPreviewedCategory( null ) }
											onClick={ ( event ) => {
												setTooltipContent( metric.description );
												const rect = event.currentTarget.getBoundingClientRect();
												positionTooltip( rect.left + rect.width / 2, rect.bottom );
												setSelectedCategory( ( current ) =>
													current === category ? null : category
												);
											} }
										>
											<span>{ metric.label }</span>
											<strong>{ maxPointsLabel }</strong>
										</button>
									</div>
								);
							} ) }
						</div>
					</section>
				) ) }
			</div>
			<div
				id="amplify-rubric-tooltip"
				ref={ tooltipRef }
				className="dashboard-amplify-story__rubric-tooltip"
				role="tooltip"
				aria-hidden={ ! activeCategory }
				data-visible={ !! activeCategory }
				style={ { left: tooltipPosition.x, top: tooltipPosition.y } }
			>
				<span key={ tooltipContent }>{ tooltipContent }</span>
			</div>
		</section>
	);
}

export default function AmplifyOverviewStory() {
	const { recordTracksEvent } = useAnalytics();
	const [ isSampleOpen, setIsSampleOpen ] = useState( false );
	return (
		<div className="dashboard-amplify-story">
			<section
				className="dashboard-amplify-story__section"
				aria-labelledby="amplify-perspectives-title"
			>
				<div className="dashboard-amplify-story__graphic">
					<FindingGraphic />
				</div>
				<div className="dashboard-amplify-story__copy">
					<Heading id="amplify-perspectives-title" level={ 2 }>
						{ __( 'Specific findings you can pitch' ) }
					</Heading>
					<p>
						{ __(
							'Every finding names the problem, why it costs the business customers, and how to improve it, so you walk into the pitch with specifics instead of opinions.'
						) }
					</p>
				</div>
			</section>

			<section
				className="dashboard-amplify-story__section"
				aria-labelledby="amplify-categories-title"
			>
				<div className="dashboard-amplify-story__graphic">
					<CategoriesGraphic />
				</div>
				<div className="dashboard-amplify-story__copy">
					<Heading id="amplify-categories-title" level={ 2 }>
						{ __( 'What’s in the report' ) }
					</Heading>
					<p>
						{ __(
							'A comprehensive PDF report with detailed findings on problem areas, so you can approach a prospect with proof of why their site needs work and a clear roadmap for how you’ll improve it once they hire your agency.'
						) }
					</p>
					<Button
						variant="link"
						className="dashboard-amplify-story__sample-link"
						onClick={ () => {
							recordTracksEvent( 'calypso_a4a_amplify_sample_report_open', { source: 'story' } );
							setIsSampleOpen( true );
						} }
					>
						{ __( 'View a sample report' ) }
					</Button>
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

			<ScoreCategories />

			<AmplifyAlsoUseful />

			<section className="dashboard-amplify-story__faq" aria-labelledby="amplify-faq-title">
				<Heading id="amplify-faq-title" level={ 2 }>
					{ __( 'Frequently asked questions' ) }
				</Heading>
				<p className="dashboard-amplify-story__faq-intro">
					{ __( 'A few things to know before you create or share a report.' ) }
				</p>
				<Panel className="dashboard-amplify-story__faq-list">
					{ FAQS.map( ( faq ) => (
						<PanelBody
							key={ faq.id }
							title={ faq.question }
							initialOpen={ false }
							onToggle={ ( isOpen ) =>
								recordTracksEvent(
									isOpen ? 'calypso_a4a_amplify_faq_open' : 'calypso_a4a_amplify_faq_close',
									{ faq_id: faq.id }
								)
							}
						>
							<p>{ faq.answer }</p>
						</PanelBody>
					) ) }
				</Panel>
			</section>
			{ isSampleOpen && <AmplifySampleReportModal onClose={ () => setIsSampleOpen( false ) } /> }
		</div>
	);
}
