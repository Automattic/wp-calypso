import { Button, Spinner } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { arrowLeft } from '@wordpress/icons';
import { trackContentResearchInsert, trackContentResearchSummarize } from '../../utils/tracking';
import type { ResearchSummary } from '../../types';

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
	const { insertBlocks } = useDispatch( 'core/block-editor' ) as {
		insertBlocks: ( blocks: unknown[] ) => void;
	};

	const handleSummarize = () => {
		trackContentResearchSummarize( topic, resultCount );
		onSummarize();
	};

	const handleInsert = () => {
		if ( ! summary ) {
			return;
		}

		trackContentResearchInsert( topic );

		// Use wp.blocks.createBlock if available (externalized by webpack).
		const wpBlocks = ( window as unknown as Record< string, unknown > ).wp as
			| { blocks?: { createBlock: ( name: string, attrs: object ) => unknown } }
			| undefined;

		if ( wpBlocks?.blocks?.createBlock ) {
			const block = wpBlocks.blocks.createBlock( 'core/paragraph', {
				content: summary.summary,
			} );
			insertBlocks( [ block ] );
		}
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

	const backButton = (
		<Button
			className="content-research-ai-summary__back"
			variant="tertiary"
			icon={ arrowLeft }
			onClick={ onClose }
		>
			{ __( 'Back to results', 'content-research' ) }
		</Button>
	);

	if ( isLoading ) {
		return (
			<div className={ `${ containerClass } content-research-ai-summary--loading` }>
				{ backButton }
				<div className="content-research-ai-summary__loading-indicator">
					<Spinner />
					<span>{ __( 'Generating summary…', 'content-research' ) }</span>
				</div>
			</div>
		);
	}

	if ( ! summary ) {
		return null;
	}

	return (
		<div className={ containerClass }>
			{ backButton }
			<div className="content-research-ai-summary__content">
				<p className="content-research-ai-summary__text">{ summary.summary }</p>
				{ summary.key_findings.length > 0 && (
					<div className="content-research-ai-summary__findings">
						<strong>{ __( 'Key findings:', 'content-research' ) }</strong>
						<ul>
							{ summary.key_findings.map( ( finding, i ) => (
								<li key={ i }>{ finding }</li>
							) ) }
						</ul>
					</div>
				) }
				{ summary.suggested_angles.length > 0 && (
					<div className="content-research-ai-summary__angles">
						<strong>{ __( 'Suggested angles:', 'content-research' ) }</strong>
						<ul>
							{ summary.suggested_angles.map( ( angle, i ) => (
								<li key={ i }>{ angle }</li>
							) ) }
						</ul>
					</div>
				) }
			</div>
			<Button variant="primary" onClick={ handleInsert }>
				{ __( 'Insert into post', 'content-research' ) }
			</Button>
		</div>
	);
}
