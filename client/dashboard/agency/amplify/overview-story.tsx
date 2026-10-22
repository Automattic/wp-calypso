import { __experimentalHeading as Heading } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useTermTooltip } from '../components/term-tooltip';
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
				<span>{ __( 'AI systems' ) }</span>
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

function EvidenceGraphic() {
	return (
		<div className="dashboard-amplify-story__evidence" aria-hidden="true">
			<div className="dashboard-amplify-story__evidence-page">
				<i className="dashboard-amplify-story__evidence-nav" />
				<i className="dashboard-amplify-story__evidence-heading" />
				<i className="dashboard-amplify-story__evidence-copy" />
				<i className="dashboard-amplify-story__evidence-button" />
				<span className="dashboard-amplify-story__evidence-marker dashboard-amplify-story__evidence-marker--one">
					1
				</span>
				<span className="dashboard-amplify-story__evidence-marker dashboard-amplify-story__evidence-marker--two">
					2
				</span>
			</div>
			<div className="dashboard-amplify-story__evidence-notes">
				<p>
					<strong>1</strong>
					<span>{ __( 'Make the primary action clearer.' ) }</span>
				</p>
				<p>
					<strong>2</strong>
					<span>{ __( 'Add recognizable proof.' ) }</span>
				</p>
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
	return (
		<section className="dashboard-amplify-story__rubric" aria-labelledby="amplify-rubric-title">
			<Heading id="amplify-rubric-title" level={ 2 }>
				{ __( 'What each score looks for' ) }
			</Heading>
			<p className="dashboard-amplify-story__rubric-intro">
				{ __(
					'Each perspective looks at eight categories. Together, they show where a homepage is working and where it needs attention.'
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
							{ PERSPECTIVES[ type ].label }
						</Heading>
						<p>
							{ type === 'human'
								? __( 'How a new visitor experiences the homepage.' )
								: __( 'How clearly AI tools can access and understand the homepage.' ) }
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

			<section
				className="dashboard-amplify-story__section"
				aria-labelledby="amplify-evidence-title"
			>
				<div className="dashboard-amplify-story__graphic">
					<EvidenceGraphic />
				</div>
				<div className="dashboard-amplify-story__copy">
					<Heading id="amplify-evidence-title" level={ 2 }>
						{ __( 'Show what the report saw' ) }
					</Heading>
					<p>
						{ __(
							'Reports include the homepage views used during analysis. Numbered markers connect visible opportunities to clear notes and a prioritized action plan, so clients can see what needs attention and why.'
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
