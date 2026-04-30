import { Button, Icon, Spinner } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { arrowLeft, chevronDown, chevronUp } from '@wordpress/icons';
import { trackContentResearchSummarize } from '../../utils/tracking';
import type { ResearchSummary } from '../../types';

const PROGRESS_STEPS = [
	__( 'Fetching articles…', 'content-research' ),
	__( 'Reading content…', 'content-research' ),
	__( 'Analyzing sources…', 'content-research' ),
	__( 'Generating summary…', 'content-research' ),
];

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
		<div className={ `content-research-ai-summary__section ${ className ?? '' }`.trim() }>
			<button
				type="button"
				className="content-research-ai-summary__section-toggle"
				onClick={ () => setIsOpen( ! isOpen ) }
				aria-expanded={ isOpen }
			>
				<span className="content-research-ai-summary__section-title">{ title }</span>
				<Icon icon={ isOpen ? chevronUp : chevronDown } size={ 20 } />
			</button>
			{ isOpen && <div className="content-research-ai-summary__section-content">{ children }</div> }
		</div>
	);
}

interface AiSummaryProps {
	topic: string;
	summary?: ResearchSummary;
	isLoading: boolean;
	onSummarize: () => void;
	onClose: () => void;
	resultCount: number;
	selectedCount: number;
	isExpanded: boolean;
}

export default function AiSummary( {
	topic,
	summary,
	isLoading,
	onSummarize,
	onClose,
	resultCount,
	selectedCount,
	isExpanded,
}: AiSummaryProps ) {
	const progressMessage = useProgressMessage( isLoading );

	const handleSummarize = () => {
		trackContentResearchSummarize( topic, resultCount );
		onSummarize();
	};

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
				<Button variant="secondary" onClick={ handleSummarize } disabled={ selectedCount === 0 }>
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

	return (
		<div className={ containerClass }>
			<div className="content-research-ai-summary__scrollable">
				<div className="content-research-ai-summary__content">
					<div className="content-research-ai-summary__section">
						<p className="content-research-ai-summary__text">{ summary.summary }</p>
					</div>
					{ summary.key_findings.length > 0 && (
						<CollapsibleSection
							title={ __( 'Key findings', 'content-research' ) }
							className="content-research-ai-summary__findings"
						>
							<ul>
								{ summary.key_findings.map( ( finding, i ) => (
									<li key={ i }>{ finding }</li>
								) ) }
							</ul>
						</CollapsibleSection>
					) }
					{ summary.suggested_angles.length > 0 && (
						<CollapsibleSection
							title={ __( 'Suggested angles', 'content-research' ) }
							className="content-research-ai-summary__angles"
						>
							<ul>
								{ summary.suggested_angles.map( ( angle, i ) => (
									<li key={ i }>{ angle }</li>
								) ) }
							</ul>
						</CollapsibleSection>
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
