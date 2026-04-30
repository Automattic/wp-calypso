import { CheckboxControl, ExternalLink } from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import { trackContentResearchResultClick } from '../../utils/tracking';
import type { ResearchResult } from '../../types';

interface ResultCardProps {
	result: ResearchResult;
	isSelected: boolean;
	onToggleSelect: () => void;
}

function getSourceAbbreviation( source: string ): string {
	switch ( source ) {
		case 'hn':
			return 'HN';
		case 'reader':
			return 'WP';
		case 'googlenews':
			return 'GN';
		default:
			return source.slice( 0, 2 ).toUpperCase();
	}
}

function getSourceLabel( source: string ): string {
	switch ( source ) {
		case 'hn':
			return 'Hacker News';
		case 'reader':
			return 'WordPress.com';
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

export default function ResultCard( { result, isSelected, onToggleSelect }: ResultCardProps ) {
	const engagement = formatEngagement( result );
	const timeAgo = formatTimestamp( result.timestamp );

	return (
		<div
			className={ `content-research-result-card${ isSelected ? ' is-selected' : '' }` }
			onClick={ ( e ) => {
				// Don't toggle if clicking a link or the checkbox itself.
				if ( ( e.target as HTMLElement ).closest( 'a, input, .components-checkbox-control' ) ) {
					return;
				}
				onToggleSelect();
			} }
			role="button"
			tabIndex={ 0 }
			onKeyDown={ ( e ) => {
				if ( e.key === ' ' || e.key === 'Enter' ) {
					e.preventDefault();
					onToggleSelect();
				}
			} }
		>
			<CheckboxControl
				className="content-research-result-card__checkbox"
				checked={ isSelected }
				onChange={ onToggleSelect }
				aria-label={ __( 'Select result for summary', 'content-research' ) }
			/>
			<div className="content-research-result-card__body">
				<ExternalLink
					className="content-research-result-card__title"
					href={ result.url }
					onClick={ () => trackContentResearchResultClick( result.source, result.url ) }
				>
					<span
						className={ `content-research-result-card__source-icon content-research-result-card__source-icon--${ result.source }` }
						title={ getSourceLabel( result.source ) }
					>
						{ getSourceAbbreviation( result.source ) }
					</span>
					<span className="content-research-result-card__title-text">
						{ decodeEntities( result.title ) }
					</span>
				</ExternalLink>
				{ result.excerpt && (
					<p className="content-research-result-card__excerpt">
						{ decodeEntities( result.excerpt ) }
					</p>
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
		</div>
	);
}
