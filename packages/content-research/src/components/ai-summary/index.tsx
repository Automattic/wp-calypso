import { Button, Icon, Spinner } from '@wordpress/components';
import { dispatch } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import {
	arrowLeft,
	pencil,
	check,
	chevronDown,
	chevronUp,
	cautionFilled as warning,
} from '@wordpress/icons';
import SourceIcon from '../source-icon';
import type { ResearchResult, ResearchSummary, SuggestedAngle } from '../../types';

const PROGRESS_STEPS = [
	__( 'Fetching articles…', 'content-research' ),
	__( 'Reading content…', 'content-research' ),
	__( 'Analyzing sources…', 'content-research' ),
	__( 'Generating summary…', 'content-research' ),
];

const MAX_SCORE = 5;

function useProgressMessage( isLoading: boolean ): string {
	const [ stepIndex, setStepIndex ] = useState( 0 );

	useEffect( () => {
		if ( ! isLoading ) {
			setStepIndex( 0 );
			return;
		}

		const interval = setInterval( () => {
			setStepIndex( ( prev ) => ( prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev ) );
		}, 4000 );

		return () => clearInterval( interval );
	}, [ isLoading ] );

	return PROGRESS_STEPS[ stepIndex ];
}

interface CollapsibleSectionProps {
	title: string;
	defaultOpen?: boolean;
	className?: string;
	children: React.ReactNode;
}

function CollapsibleSection( {
	title,
	defaultOpen = false,
	className,
	children,
}: CollapsibleSectionProps ) {
	const [ isOpen, setIsOpen ] = useState( defaultOpen );

	return (
		<div className={ `content-research-ai-summary__collapsible ${ className ?? '' }`.trim() }>
			<button
				className="content-research-ai-summary__collapsible-toggle"
				onClick={ () => setIsOpen( ! isOpen ) }
				aria-expanded={ isOpen }
				title={ __( 'Use as title', 'content-research' ) }
			>
				<span className="content-research-ai-summary__collapsible-title">{ title }</span>
				<Icon icon={ isOpen ? chevronUp : chevronDown } size={ 20 } />
			</button>
			{ isOpen && (
				<div className="content-research-ai-summary__collapsible-content">{ children }</div>
			) }
		</div>
	);
}

interface SectionProps {
	title: string;
	tone?: 'default' | 'highlight' | 'caution';
	children: React.ReactNode;
}

function Section( { title, tone = 'default', children }: SectionProps ) {
	let toneClass = '';
	if ( tone === 'highlight' ) {
		toneClass = ' is-highlight';
	} else if ( tone === 'caution' ) {
		toneClass = ' is-caution';
	}
	return (
		<section className={ `content-research-ai-summary__block${ toneClass }` }>
			<h3 className="content-research-ai-summary__block-title">{ title }</h3>
			<div className="content-research-ai-summary__block-body">{ children }</div>
		</section>
	);
}

interface CopyableItemProps {
	text: string;
}

interface CoreEditorActions {
	editPost: ( post: { title: string } ) => void;
}

function setPostTitle( title: string ) {
	const editorActions = dispatch( 'core/editor' ) as CoreEditorActions;
	editorActions.editPost( { title } );
}

function TitleSuggestionItem( { text }: CopyableItemProps ) {
	const onApplyTitle = () => {
		setPostTitle( text );
	};

	return (
		<li className="content-research-ai-summary__copyable">
			<span className="content-research-ai-summary__copyable-text">{ text }</span>
			<Button
				className="content-research-ai-summary__copyable-button"
				icon={ pencil }
				onClick={ onApplyTitle }
				title={ __( 'Use as title', 'content-research' ) }
			/>
		</li>
	);
}

function normalizeAngles( angles: ResearchSummary[ 'suggested_angles' ] ): SuggestedAngle[] {
	if ( ! Array.isArray( angles ) ) {
		return [];
	}
	return angles.map( ( raw ) => {
		if ( typeof raw === 'string' ) {
			return { type: '', angle: raw };
		}
		return {
			type: raw?.type ?? '',
			angle: raw?.angle ?? '',
			blog_value: raw?.blog_value,
		};
	} );
}

function deriveTldr( summary: ResearchSummary ): string | null {
	if ( summary.tldr && summary.tldr.trim() ) {
		return summary.tldr.trim();
	}
	if ( ! summary.summary ) {
		return null;
	}
	const sentences = summary.summary
		.split( /(?<=[.!?])\s+/ )
		.slice( 0, 2 )
		.join( ' ' );
	if ( sentences && sentences.length < summary.summary.length ) {
		return sentences;
	}
	return null;
}

function nonEmptyArray( value: string[] | undefined ): string[] {
	if ( ! Array.isArray( value ) ) {
		return [];
	}
	return value.map( ( item ) => ( typeof item === 'string' ? item.trim() : '' ) ).filter( Boolean );
}

interface RelevanceMeterProps {
	score: number;
}

function RelevanceMeter( { score }: RelevanceMeterProps ) {
	const clamped = Math.max( 0, Math.min( MAX_SCORE, Math.round( score ) ) );
	return (
		<div
			className="content-research-ai-summary__relevance-meter"
			role="img"
			aria-label={ sprintf(
				/* translators: 1: score, 2: max score */
				__( 'Editorial relevance: %1$d out of %2$d', 'content-research' ),
				clamped,
				MAX_SCORE
			) }
		>
			<span className="content-research-ai-summary__relevance-score">
				{ sprintf( '%1$d/%2$d', clamped, MAX_SCORE ) }
			</span>
			<span className="content-research-ai-summary__relevance-dots" aria-hidden="true">
				{ Array.from( { length: MAX_SCORE } ).map( ( _, i ) => (
					<span
						key={ i }
						className={ `content-research-ai-summary__relevance-dot${
							i < clamped ? ' is-filled' : ''
						}` }
					/>
				) ) }
			</span>
		</div>
	);
}

interface AiSummaryProps {
	summary?: ResearchSummary;
	isLoading: boolean;
	onSummarize: () => void;
	onClose: () => void;
	hasResults: boolean;
	selectedCount: number;
	isExpanded: boolean;
	sourceArticles?: ResearchResult[];
}

export default function AiSummary( {
	summary,
	isLoading,
	onSummarize,
	onClose,
	hasResults,
	selectedCount,
	isExpanded,
	sourceArticles,
}: AiSummaryProps ) {
	const progressMessage = useProgressMessage( isLoading );

	if ( ( ! summary && ! isLoading ) || ! isExpanded ) {
		const label =
			selectedCount > 0
				? sprintf(
						/* translators: %d: number of selected articles */
						__( 'Summarize selected (%d)', 'content-research' ),
						selectedCount
				  )
				: __( 'Summarize', 'content-research' );
		return (
			<div className="content-research-ai-summary">
				<Button variant="secondary" onClick={ onSummarize } disabled={ ! hasResults }>
					{ label }
				</Button>
			</div>
		);
	}

	const containerClass = `content-research-ai-summary${
		isExpanded ? ' content-research-ai-summary--expanded' : ''
	}`;

	if ( isLoading ) {
		return (
			<div className={ `${ containerClass } content-research-ai-summary--loading` }>
				<div className="content-research-ai-summary__loading-indicator">
					<Spinner />
					<span>{ progressMessage }</span>
				</div>
				<div className="content-research-ai-summary__footer">
					<Button
						className="content-research-ai-summary__back"
						variant="tertiary"
						icon={ arrowLeft }
						onClick={ onClose }
					>
						{ __( 'Back to results', 'content-research' ) }
					</Button>
				</div>
			</div>
		);
	}

	if ( ! summary ) {
		return null;
	}

	const tldr = deriveTldr( summary );
	const whyItMatters = summary.why_it_matters?.trim();
	const keyFindings = nonEmptyArray( summary.key_findings );
	const angles = normalizeAngles( summary.suggested_angles ?? [] ).filter( ( a ) => a.angle );
	const brief = summary.blogger_brief ?? {};
	const bestAngle = brief.best_angle?.trim() || angles[ 0 ]?.angle;
	const coreThesis = brief.core_thesis?.trim();
	const readerTakeaway = brief.reader_takeaway?.trim();
	const whatToAdd = nonEmptyArray( brief.what_to_add );
	const avoid = nonEmptyArray( brief.avoid );
	const headlineIdeas = nonEmptyArray( summary.headline_ideas );
	const openingHooks = nonEmptyArray( summary.opening_hooks );
	const audience = nonEmptyArray( summary.audience );
	const seoKeywords = nonEmptyArray( summary.seo_keywords );
	const tags = nonEmptyArray( summary.tags );
	const relevance = summary.editorial_relevance;
	const factCheckNotes = nonEmptyArray( summary.fact_check_notes );
	const detailedSummary = summary.summary?.trim();

	return (
		<div className={ containerClass }>
			<div className="content-research-ai-summary__scrollable">
				<div className="content-research-ai-summary__content">
					{ summary.title && (
						<h2 className="content-research-ai-summary__title">{ summary.title }</h2>
					) }

					{ bestAngle && (
						<Section title={ __( 'Recommended blog angle', 'content-research' ) } tone="highlight">
							<p className="content-research-ai-summary__text">{ bestAngle }</p>
						</Section>
					) }

					{ coreThesis && (
						<Section title={ __( 'Core thesis', 'content-research' ) } tone="highlight">
							<p className="content-research-ai-summary__text">{ coreThesis }</p>
						</Section>
					) }

					{ readerTakeaway && (
						<Section title={ __( 'Reader takeaway', 'content-research' ) }>
							<p className="content-research-ai-summary__text">{ readerTakeaway }</p>
						</Section>
					) }

					{ tldr && (
						<Section title={ __( 'In short', 'content-research' ) }>
							<p className="content-research-ai-summary__text">{ tldr }</p>
						</Section>
					) }

					{ whyItMatters && (
						<Section title={ __( 'Why it matters', 'content-research' ) }>
							<p className="content-research-ai-summary__text">{ whyItMatters }</p>
						</Section>
					) }

					{ headlineIdeas.length > 0 && (
						<Section title={ __( 'Headline ideas', 'content-research' ) }>
							<ul className="content-research-ai-summary__copyable-list">
								{ headlineIdeas.map( ( headline, i ) => (
									<TitleSuggestionItem key={ i } text={ headline } />
								) ) }
							</ul>
						</Section>
					) }

					{ openingHooks.length > 0 && (
						<Section title={ __( 'Opening hooks', 'content-research' ) }>
							<ul className="content-research-ai-summary__copyable-list">
								{ openingHooks.map( ( hook, i ) => (
									<li key={ i } className="content-research-ai-summary__copyable">
										<span className="content-research-ai-summary__copyable-text">{ hook }</span>
									</li>
								) ) }
							</ul>
						</Section>
					) }

					{ keyFindings.length > 0 && (
						<Section title={ __( 'Key findings', 'content-research' ) }>
							<ul className="content-research-ai-summary__findings-list">
								{ keyFindings.map( ( finding, i ) => (
									<li key={ i }>{ finding }</li>
								) ) }
							</ul>
						</Section>
					) }

					{ angles.length > 0 && (
						<Section title={ __( 'Suggested angles', 'content-research' ) }>
							<ul className="content-research-ai-summary__angles-list">
								{ angles.map( ( angle, i ) => (
									<li key={ i } className="content-research-ai-summary__angle">
										{ angle.type && (
											<span className="content-research-ai-summary__angle-type">
												{ angle.type }
											</span>
										) }
										<span className="content-research-ai-summary__angle-text">{ angle.angle }</span>
										{ angle.blog_value && (
											<span className="content-research-ai-summary__angle-value">
												<strong>{ __( 'Why it works:', 'content-research' ) }</strong>{ ' ' }
												{ angle.blog_value }
											</span>
										) }
									</li>
								) ) }
							</ul>
						</Section>
					) }

					{ whatToAdd.length > 0 && (
						<Section title={ __( 'What to add', 'content-research' ) }>
							<ul className="content-research-ai-summary__checklist">
								{ whatToAdd.map( ( item, i ) => (
									<li key={ i }>
										<Icon
											className="content-research-ai-summary__checklist-icon"
											icon={ check }
											size={ 16 }
										/>
										<span>{ item }</span>
									</li>
								) ) }
							</ul>
						</Section>
					) }

					{ avoid.length > 0 && (
						<Section title={ __( 'What to avoid', 'content-research' ) } tone="caution">
							<ul className="content-research-ai-summary__caution-list">
								{ avoid.map( ( item, i ) => (
									<li key={ i }>
										<Icon
											className="content-research-ai-summary__caution-icon"
											icon={ warning }
											size={ 16 }
										/>
										<span>{ item }</span>
									</li>
								) ) }
							</ul>
						</Section>
					) }

					{ audience.length > 0 && (
						<Section title={ __( 'Audience', 'content-research' ) }>
							<ul className="content-research-ai-summary__pills-list">
								{ audience.map( ( item, i ) => (
									<li key={ i } className="content-research-ai-summary__pill">
										{ item }
									</li>
								) ) }
							</ul>
						</Section>
					) }

					{ seoKeywords.length > 0 && (
						<Section title={ __( 'SEO keywords', 'content-research' ) }>
							<ul className="content-research-ai-summary__keywords-list">
								{ seoKeywords.map( ( keyword, i ) => (
									<li key={ i } className="content-research-ai-summary__keyword">
										{ keyword }
									</li>
								) ) }
							</ul>
						</Section>
					) }

					{ tags.length > 0 && (
						<Section title={ __( 'Tags', 'content-research' ) }>
							<ul className="content-research-ai-summary__tags-list">
								{ tags.map( ( tag, i ) => (
									<li key={ i } className="content-research-ai-summary__tag">
										#{ tag }
									</li>
								) ) }
							</ul>
						</Section>
					) }

					{ relevance && typeof relevance.score === 'number' && (
						<Section title={ __( 'Editorial relevance', 'content-research' ) }>
							<RelevanceMeter score={ relevance.score } />
							{ relevance.reason && (
								<p className="content-research-ai-summary__relevance-reason">
									{ relevance.reason }
								</p>
							) }
						</Section>
					) }

					{ factCheckNotes.length > 0 && (
						<Section title={ __( 'Fact-check notes', 'content-research' ) } tone="caution">
							<ul className="content-research-ai-summary__caution-list">
								{ factCheckNotes.map( ( note, i ) => (
									<li key={ i }>
										<Icon
											className="content-research-ai-summary__caution-icon"
											icon={ warning }
											size={ 16 }
										/>
										<span>{ note }</span>
									</li>
								) ) }
							</ul>
						</Section>
					) }

					{ detailedSummary && (
						<CollapsibleSection
							title={ __( 'Detailed summary', 'content-research' ) }
							className="content-research-ai-summary__detailed"
						>
							<p className="content-research-ai-summary__text">{ detailedSummary }</p>
						</CollapsibleSection>
					) }

					{ sourceArticles && sourceArticles.length > 0 && (
						<Section title={ __( 'Articles used', 'content-research' ) }>
							<ul className="content-research-ai-summary__sources-list">
								{ sourceArticles.map( ( article ) => (
									<li key={ article.url } className="content-research-ai-summary__source">
										<SourceIcon source={ article.source } />
										<a
											className="content-research-ai-summary__source-link"
											href={ article.url }
											target="_blank"
											rel="noreferrer noopener"
										>
											{ article.title }
										</a>
									</li>
								) ) }
							</ul>
						</Section>
					) }
				</div>
			</div>
			<div className="content-research-ai-summary__footer">
				<Button
					className="content-research-ai-summary__back"
					variant="tertiary"
					icon={ arrowLeft }
					onClick={ onClose }
				>
					{ __( 'Back to results', 'content-research' ) }
				</Button>
			</div>
		</div>
	);
}
