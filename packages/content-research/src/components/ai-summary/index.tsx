import { Button, Spinner } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { trackContentResearchInsert, trackContentResearchSummarize } from '../../utils/tracking';
import type { ResearchSummary } from '../../types';

interface AiSummaryProps {
	topic: string;
	summary?: ResearchSummary;
	isLoading: boolean;
	onSummarize: () => void;
	resultCount: number;
}

export default function AiSummary( {
	topic,
	summary,
	isLoading,
	onSummarize,
	resultCount,
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

	if ( ! summary && ! isLoading ) {
		return (
			<div className="content-research-ai-summary">
				<Button variant="secondary" onClick={ handleSummarize } disabled={ resultCount === 0 }>
					{ __( 'AI Summary', 'content-research' ) }
				</Button>
			</div>
		);
	}

	if ( isLoading ) {
		return (
			<div className="content-research-ai-summary content-research-ai-summary--loading">
				<Spinner />
				<span>{ __( 'Generating summary…', 'content-research' ) }</span>
			</div>
		);
	}

	if ( ! summary ) {
		return null;
	}

	return (
		<div className="content-research-ai-summary">
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
