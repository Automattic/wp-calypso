import { __experimentalHeading as Heading } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import { PERSPECTIVES } from './score-preview';
import { severityFor } from './score-severity';

const FAQS = [
	{
		question: __( 'Do I need access to the site?' ),
		answer: __(
			'No. Enter the URL of any public homepage, including a site you’re pitching to. You do not need to connect the site or sign in to it.'
		),
	},
	{
		question: __( 'Does Amplify analyze the whole site?' ),
		answer: __(
			'Not yet. Amplify looks at a public homepage—the place where many visitors and AI tools first encounter a business. The report is a point-in-time view, not a full-site audit.'
		),
	},
	{
		question: __( 'What’s included in a full report?' ),
		answer: __(
			'A full report combines the first-time visitor and AI systems perspectives. Each has its own score out of 100, category breakdown, findings, and suggested next steps. You can also create a report for just one perspective.'
		),
	},
	{
		question: __( 'How should I use the scores?' ),
		answer: __(
			'Treat them as directional signals, not a final verdict. Use the category scores and individual findings to start a conversation about what is working, what needs attention, and what to improve first.'
		),
	},
	{
		question: __( 'What can I do with the prompts?' ),
		answer: __(
			'Findings include prompts you can bring to an AI agent to explore or implement a fix. Review the result against the site and your client’s goals before making a change.'
		),
	},
	{
		question: __( 'Can I share a report with a client?' ),
		answer: __(
			'Yes. Download the completed report as a PDF to bring to a pitch or share during a client check-in.'
		),
	},
	{
		question: __( 'Will a report update after the homepage changes?' ),
		answer: __(
			'No. Each report captures the public homepage at the time of analysis. Create another report after making changes to see an updated assessment.'
		),
	},
];

function PerspectivesGraphic() {
	return (
		<div className="dashboard-amplify-story__perspectives" aria-hidden="true">
			<div className="dashboard-amplify-story__mini-report">
				<span>{ __( 'First-time visitors' ) }</span>
				<strong>46/100</strong>
				<i />
				<i />
				<i />
			</div>
			<div className="dashboard-amplify-story__mini-report">
				<span>{ __( 'AI agents' ) }</span>
				<strong>50/100</strong>
				<i />
				<i />
				<i />
			</div>
		</div>
	);
}

function CategoriesGraphic() {
	return (
		<div className="dashboard-amplify-story__categories" aria-hidden="true">
			<span>{ __( 'Category breakdown' ) }</span>
			{ [
				{ label: __( 'Trust signals' ), score: 4, max: 18 },
				{ label: __( 'Mobile experience' ), score: 7, max: 12 },
				{ label: __( 'Content quality' ), score: 11, max: 12 },
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
					'Rewrite the homepage headline so it clearly names who this business serves and the outcome it delivers.'
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
					'Each perspective looks at eight categories. Together, they show where a homepage is working and where it needs attention.'
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
							{ PERSPECTIVES[ type ].label }
						</Heading>
						<p>
							{ type === 'human'
								? __( 'How a new visitor experiences the homepage.' )
								: __( 'How clearly AI tools can access and understand the homepage.' ) }
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
	return (
		<div className="dashboard-amplify-story">
			<section
				className="dashboard-amplify-story__section"
				aria-labelledby="amplify-perspectives-title"
			>
				<div className="dashboard-amplify-story__graphic">
					<PerspectivesGraphic />
				</div>
				<div className="dashboard-amplify-story__copy">
					<Heading id="amplify-perspectives-title" level={ 2 }>
						{ __( 'Two perspectives on one homepage' ) }
					</Heading>
					<p>
						{ __(
							'See how the homepage feels to someone visiting for the first time and how clearly AI systems can understand it. Choose either perspective, or bring both together in a full report.'
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
						{ __( 'Go beyond a single score' ) }
					</Heading>
					<p>
						{ __(
							'Category scores show where to focus. The visitor report covers things like trust, content, mobile experience, and conversion. The AI report looks at technical health, structured data, and how specifically the site describes the business.'
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
						{ __( 'Bring a concrete next step to the pitch' ) }
					</Heading>
					<p>
						{ __(
							'Each finding explains what needs attention and includes a prompt you can take to an AI agent. Use it to explore a fix, then apply your own judgment before sharing or publishing the result.'
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
						<div className="dashboard-amplify-story__faq-item" key={ faq.question }>
							<Heading level={ 3 }>{ faq.question }</Heading>
							<p>{ faq.answer }</p>
						</div>
					) ) }
				</div>
			</section>
		</div>
	);
}
