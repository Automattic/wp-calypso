/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/**
 * External dependencies
 */
import React from 'react';
import { localize, useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import HelpSearchCard from 'calypso/blocks/inline-help/inline-help-search-card';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getInlineHelpAdminSectionSearchResultsForQuery } from 'calypso/state/inline-help/selectors/get-inline-help-search-results-for-query';
import hasInlineHelpAPIResults from 'calypso/state/selectors/has-inline-help-api-results';
import { selectResult } from 'calypso/state/inline-help/actions';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import QueryInlineHelpSearch from 'calypso/components/data/query-inline-help-search';

/**
 * Style dependencies
 */
import './style.scss';
import getSearchQuery from 'calypso/state/inline-help/selectors/get-search-query';

export function PopUpSearch( props ) {
	const translate = useTranslate();

	const onChildClick = ( e ) => e.stopPropagation();

	const onResultClick = ( link ) => {
		props.onClose();
		window.location.href = localizeUrl( link );
	};
	return (
		<div role="button" className="popup-search__mask" onClick={ props.onClose }>
			<div className="popup-search__container" onClick={ onChildClick }>
				<HelpSearchCard
					forceFocus={ true }
					onSelect={ () => {} }
					query={ props.searchQuery }
					location={ 'TEST' }
					placeholder={ translate( 'Search wordpress actions' ) }
				/>
				<QueryInlineHelpSearch query={ props.searchQuery } />
				{ props.searchResults.length > 0 && (
					<div className="popup-search__results" aria-label="Pop Up Search">
						{ props.searchResults.slice( 0, 10 ).map( ( { link, key, title, description } ) => (
							<a href={ localizeUrl( link ) }>
								<div
									role="button"
									className="popup-search__result-single"
									key={ key }
									onClick={ () => onResultClick( link ) }
								>
									<div className="popup-search__results-cell">
										<div>
											<h2>{ title }</h2>
										</div>
										<div className="popup-search__description">
											<em>{ description }</em>
										</div>
									</div>
								</div>
							</a>
						) ) }
					</div>
				) }
			</div>
		</div>
	);
}

export default connect(
	( state ) => ( {
		searchQuery: getSearchQuery( state ),
		searchResults: getInlineHelpAdminSectionSearchResultsForQuery( state ),
		hasAPIResults: hasInlineHelpAPIResults( state ),
	} ),
	{
		track: recordTracksEvent,
		selectSearchResult: selectResult,
	}
)( localize( PopUpSearch ) );
