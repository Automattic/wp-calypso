import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { trackContentResearchResultClick } from '../../utils/tracking';
import type { ResearchResult } from '../../types';

interface ResultCardProps {
	result: ResearchResult;
}

function getSourceLabel( source: string ): string {
	switch ( source ) {
		case 'reddit':
			return 'Reddit';
		case 'hn':
			return 'Hacker News';
		case 'polymarket':
			return 'Polymarket';
		case 'reader':
			return 'WPcom Reader';
		case 'googlenews':
			return 'Google News';
		default:
			return source;
	}
}

function formatEngagement( result: ResearchResult ): string {
	const parts: string[] = [];

	if ( result.engagement?.upvotes !== undefined ) {
		parts.push( `${ result.engagement.upvotes.toLocaleString() } pts` );
	}

	if ( result.engagement?.comments !== undefined ) {
		parts.push( `${ result.engagement.comments.toLocaleString() } comments` );
	}

	if ( result.odds ) {
		parts.push( result.odds );
	}

	if ( result.volume ) {
		parts.push( result.volume );
	}

	return parts.join( ' · ' );
}

function formatTimestamp( timestamp?: string ): string {
	if ( ! timestamp ) {
		return '';
	}

	const date = new Date( timestamp );
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffHours = Math.floor( diffMs / ( 1000 * 60 * 60 ) );

	if ( diffHours < 1 ) {
		return __( 'just now', 'content-research' );
	}
	if ( diffHours < 24 ) {
		return `${ diffHours }h ago`;
	}
	const diffDays = Math.floor( diffHours / 24 );
	return `${ diffDays }d ago`;
}

export default function ResultCard( { result }: ResultCardProps ) {
	const engagement = formatEngagement( result );
	const timeAgo = formatTimestamp( result.timestamp );

	return (
		<div className="content-research-result-card">
			<div className="content-research-result-card__header">
				<span className="content-research-result-card__source">
					{ getSourceLabel( result.source ) }
				</span>
				{ result.subreddit && (
					<span className="content-research-result-card__subreddit">{ result.subreddit }</span>
				) }
			</div>
			<ExternalLink
				className="content-research-result-card__title"
				href={ result.url }
				onClick={ () => trackContentResearchResultClick( result.source, result.url ) }
			>
				{ result.title }
			</ExternalLink>
			{ result.excerpt && (
				<p className="content-research-result-card__excerpt">{ result.excerpt }</p>
			) }
			<div className="content-research-result-card__meta">
				{ engagement && (
					<span className="content-research-result-card__engagement">{ engagement }</span>
				) }
				{ timeAgo && <span className="content-research-result-card__time">{ timeAgo }</span> }
				{ result.author && (
					<span className="content-research-result-card__author">{ result.author }</span>
				) }
			</div>
		</div>
	);
}
