import {
	ExternalLink,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { Text } from '../../components/text';
import { useTermTooltip } from '../components/term-tooltip';
import { getReportTiming, getTierAllowances } from './constants';
import { SAMPLE_REPORT_URL } from './sample-report-pages';
import { getPerspectives } from './score-preview';
import {
	AudiencesGraphic,
	CategoryGraphic,
	PromptGraphic,
	ReportPagesGraphic,
} from './story-graphics';

import './overview-story.scss';

const getFaqs = () => [
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
			/* translators: 1: monthly reports for Account activated, 2: for Agency Partner, 3: for Pro Agency Partner, 4: for VIP Pro & Premier */
			__(
				'It depends on your agency tier: %1$d reports a month for Account activated, %2$d for Agency Partner, %3$d for Pro Agency Partner, and %4$d for VIP Pro & Premier. Your allowance resets on the 1st of every month, and Agency Partners and above can ask for more.'
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
	const perspectives = getPerspectives();
	return (
		<section className="dashboard-amplify-story__rubric" aria-labelledby="amplify-rubric-title">
			<VStack spacing={ 3 }>
				<Heading id="amplify-rubric-title" level={ 2 }>
					{ __( 'What each score looks for' ) }
				</Heading>
				<Text
					as="p"
					className="dashboard-amplify-story__rubric-intro"
					size={ 16 }
					lineHeight="1.6"
					color="var( --color-text-subtle )"
				>
					{ __(
						'Each lens looks at eight categories. Together, they show where a homepage is doing well and where it needs improvements.'
					) }
				</Text>
			</VStack>
			<div className="dashboard-amplify-story__rubric-columns">
				{ ( [ 'human', 'ai' ] as const ).map( ( type ) => (
					<section
						className="dashboard-amplify-story__rubric-perspective"
						key={ type }
						aria-labelledby={ `amplify-rubric-${ type }` }
					>
						<VStack spacing={ 2 }>
							<Heading id={ `amplify-rubric-${ type }` } level={ 3 } size={ 20 } lineHeight="27px">
								{ perspectives[ type ].title }
							</Heading>
							<Text
								as="p"
								className="dashboard-amplify-story__rubric-perspective-text"
								size={ 14 }
								lineHeight="1.5"
								color="var( --color-text-subtle )"
							>
								<span>
									{ type === 'human'
										? __(
												'Whether a first-time visitor trusts the business enough to get in touch.'
											)
										: __(
												'Whether AI tools can read the site, understand the business, and recommend it.'
											) }
								</span>
							</Text>
						</VStack>
						<div className="dashboard-amplify-story__rubric-grid">
							{ perspectives[ type ].metrics.map( ( metric ) => (
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
				<VStack spacing={ 4 } className="dashboard-amplify-story__copy">
					<Heading id="amplify-categories-title" level={ 2 }>
						{ __( 'What’s in the report' ) }
					</Heading>
					<VStack spacing={ 3 }>
						<Text
							as="p"
							className="dashboard-amplify-story__copy-text"
							size={ 16 }
							lineHeight="1.6"
							color="var( --color-text-subtle )"
						>
							{ __(
								'A detailed PDF of everything holding the site back. Bring prospects proof of the problems, and a clear plan for how you’ll fix them once they hire you.'
							) }
						</Text>
						<ExternalLink
							className="dashboard-amplify-story__sample-link"
							href={ SAMPLE_REPORT_URL }
							onClick={ () =>
								recordTracksEvent( 'calypso_a4a_amplify_sample_report_open', { source: 'story' } )
							}
						>
							{ __( 'View a sample report' ) }
						</ExternalLink>
					</VStack>
				</VStack>
			</section>

			<section
				className="dashboard-amplify-story__section"
				aria-labelledby="amplify-perspectives-title"
			>
				<div className="dashboard-amplify-story__graphic">
					<CategoryGraphic />
				</div>
				<VStack spacing={ 4 } className="dashboard-amplify-story__copy">
					<Heading id="amplify-perspectives-title" level={ 2 }>
						{ __( 'Specific findings you can pitch' ) }
					</Heading>
					<Text
						as="p"
						className="dashboard-amplify-story__copy-text"
						size={ 16 }
						lineHeight="1.6"
						color="var( --color-text-subtle )"
					>
						{ __(
							'Each finding names the problem, explains why it costs the business customers, and shows how to fix it. You walk into the pitch with specifics, not opinions.'
						) }
					</Text>
				</VStack>
			</section>

			<section className="dashboard-amplify-story__section" aria-labelledby="amplify-prompts-title">
				<div className="dashboard-amplify-story__graphic">
					<PromptGraphic />
				</div>
				<VStack spacing={ 4 } className="dashboard-amplify-story__copy">
					<Heading id="amplify-prompts-title" level={ 2 }>
						{ __( 'Turn it into your pitch' ) }
					</Heading>
					<Text
						as="p"
						className="dashboard-amplify-story__copy-text"
						size={ 16 }
						lineHeight="1.6"
						color="var( --color-text-subtle )"
					>
						{ __(
							'Feed the PDF into your AI tool of choice to turn it into a branded report or pitch deck in your agency’s voice.'
						) }
					</Text>
				</VStack>
			</section>

			<section
				className="dashboard-amplify-story__section"
				aria-labelledby="amplify-audiences-title"
			>
				<div className="dashboard-amplify-story__graphic">
					<AudiencesGraphic />
				</div>
				<VStack spacing={ 4 } className="dashboard-amplify-story__copy">
					<Heading id="amplify-audiences-title" level={ 2 }>
						{ __( 'Not just for new clients' ) }
					</Heading>
					<Text
						as="p"
						className="dashboard-amplify-story__copy-text"
						size={ 16 }
						lineHeight="1.6"
						color="var( --color-text-subtle )"
					>
						{ __(
							'Run one on a current client’s site to plan their next round of work, or on your own homepage to see it the way prospects do.'
						) }
					</Text>
				</VStack>
			</section>

			<ScoreCategories />

			<section className="dashboard-amplify-story__faq" aria-labelledby="amplify-faq-title">
				<VStack spacing={ 3 }>
					<Heading id="amplify-faq-title" level={ 2 }>
						{ __( 'Frequently asked questions' ) }
					</Heading>
					<Text
						as="p"
						className="dashboard-amplify-story__faq-intro"
						size={ 16 }
						lineHeight="1.6"
						color="var( --color-text-subtle )"
					>
						{ __( 'A few things to know before you create or share a report.' ) }
					</Text>
				</VStack>
				<div className="dashboard-amplify-story__faq-list">
					{ getFaqs().map( ( faq ) => (
						<VStack spacing={ 2 } className="dashboard-amplify-story__faq-item" key={ faq.id }>
							<Heading level={ 3 } size={ 18 } weight={ 600 } lineHeight="25px">
								{ faq.question }
							</Heading>
							<Text
								as="p"
								className="dashboard-amplify-story__faq-answer"
								size={ 16 }
								lineHeight="1.6"
								color="var( --color-text-subtle )"
							>
								{ faq.answer }
							</Text>
						</VStack>
					) ) }
				</div>
			</section>
		</div>
	);
}
