import { recordTracksEvent } from '@automattic/calypso-analytics';

export function trackContentResearchOpen() {
	recordTracksEvent( 'calypso_content_research_open' );
}

export function trackContentResearchSearch( topic: string ) {
	recordTracksEvent( 'calypso_content_research_search', { topic } );
}

export function trackContentResearchResultClick( source: string, url: string ) {
	recordTracksEvent( 'calypso_content_research_result_click', { source, url } );
}

export function trackContentResearchSummarize( topic: string, resultCount: number ) {
	recordTracksEvent( 'calypso_content_research_summarize', {
		topic,
		result_count: resultCount,
	} );
}
