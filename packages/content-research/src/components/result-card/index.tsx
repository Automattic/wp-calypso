import { CheckboxControl, ExternalLink } from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';
import { __, _n, sprintf } from '@wordpress/i18n';
import { trackContentResearchResultClick } from '../../utils/tracking';
import SourceIcon from '../source-icon';
import type { ResearchResult, Source } from '../../types';

interface ResultCardProps {
	result: ResearchResult;
	isSelected: boolean;
	onToggleSelect: () => void;
}

function getSourceLabel( source: Source ): string {
	switch ( source ) {
		case 'hn':
			return __( 'Hacker News', 'content-research' );
		case 'reader':
			return __( 'WordPress.com', 'content-research' );
		case 'googlenews':
			return __( 'Google News', 'content-research' );
		case 'myposts':
			return __( 'Posts', 'content-research' );
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
	if ( isNaN( date.getTime() ) ) {
		return '';
	}

	const diffMs = Date.now() - date.getTime();
	const diffHours = Math.floor( diffMs / ( 1000 * 60 * 60 ) );

	if ( diffHours < 1 ) {
		return __( 'just now', 'content-research' );
	}
	if ( diffHours < 24 ) {
		return sprintf(
			/* translators: %d: number of hours */
			_n( '%dh ago', '%dh ago', diffHours, 'content-research' ),
			diffHours
		);
	}
	const diffDays = Math.floor( diffHours / 24 );
	return sprintf(
		/* translators: %d: number of days */
		_n( '%dd ago', '%dd ago', diffDays, 'content-research' ),
		diffDays
	);
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
					<SourceIcon
						className="content-research-result-card__source-icon"
						source={ result.source }
						label={ getSourceLabel( result.source ) }
					/>
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
