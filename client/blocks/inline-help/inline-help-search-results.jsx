/**
 * External dependencies
 */
import React, { useRef, Fragment } from 'react';
import PropTypes from 'prop-types';
import { identity, isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import page from 'page';

/**
 * Internal Dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import QueryInlineHelpSearch from 'components/data/query-inline-help-search';
import PlaceholderLines from './placeholder-lines';
import { decodeEntities, preventWidows } from 'lib/formatting';
import getSearchResultsByQuery from 'state/inline-help/selectors/get-inline-help-search-results-for-query';
import getSelectedResultIndex from 'state/inline-help/selectors/get-selected-result-index';
import isRequestingInlineHelpSearchResultsForQuery from 'state/inline-help/selectors/is-requesting-inline-help-search-results-for-query';
import hasInlineHelpAPIResults from 'state/selectors/has-inline-help-api-results';
import { selectResult } from 'state/inline-help/actions';
import { localizeUrl } from 'lib/i18n-utils';
import { SUPPORT_TYPE_ADMIN_SECTION, SUPPORT_TYPE_API_HELP } from './constants';

function HelpSearchResults( {
	hasAPIResults = false,
	isSearching = false,
	onSelect,
	searchQuery = '',
	searchResults = [],
	selectedResultIndex = -1,
	selectSearchResult,
	translate = identity,
	placeholderLines,
	recordTracksEvent,
} ) {
	const supportType = useRef( searchResults?.[ 0 ]?.support_type );

	function getTitleBySectionType( addSection, type ) {
		if ( ! addSection ) {
			return null;
		}

		let title = '';
		switch ( type ) {
			case SUPPORT_TYPE_API_HELP:
				title = translate( 'Support articles:' );
				break;
			case SUPPORT_TYPE_ADMIN_SECTION:
				title = translate( 'Show me where to:' );
				break;
			default:
				return null
		}

		return (
			<li className="inline-help__results-title">
				<h2>{ title }</h2>
			</li>
		);
	}

	const onLinkClickHandler = ( type ) => ( event ) => {
		// check and catch admin section links.
		const adminLink = event?.target?.href;
		if ( type === SUPPORT_TYPE_ADMIN_SECTION && adminLink ) {
			recordTracksEvent( 'calypso_inlinehelp_admin_section_search', {
				link: adminLink,
				search_term: searchQuery,
			} );
			return page( adminLink );
		}

		// Set the current selected result item.
		onSelect( event );
	};

	const selectCurrentResultIndex = ( index ) => () => selectSearchResult( index );

	const renderHelpLink = ( { link,  key,  description,  title,  support_type = SUPPORT_TYPE_API_HELP }, index ) => {
		const addResultsSection = supportType?.current !== support_type || ! index;
		if ( addResultsSection ) {
			supportType.current = support_type;
		}

		const classes = classNames( 'inline-help__results-item', {
			'is-selected': selectedResultIndex === index,
		} );

		return (
			<Fragment key={ link ?? key }>
				{ getTitleBySectionType( addResultsSection, support_type ) }
				<li className={ classes }>
					<a
						href={ localizeUrl( link ) }
						onMouseDown={ selectCurrentResultIndex( index ) }
						onClick={ onLinkClickHandler( support_type ) }
						title={ decodeEntities( description ) }
						tabIndex={ -1 }
					>
						{ support_type === SUPPORT_TYPE_ADMIN_SECTION && <Gridicon icon="domains" size={ 18 } /> }
						<span>{ preventWidows( decodeEntities( title ) ) }</span>
						{ support_type === SUPPORT_TYPE_ADMIN_SECTION && <Gridicon icon="chevron-right" size={ 18 } /> }
					</a>
				</li>
			</Fragment>
		);
	};

	const renderSearchResults = () => {
		if ( isSearching ) {
			// reset current section reference.
			supportType.current = null;

			// search, but no results so far
			return <PlaceholderLines lines={ placeholderLines } />;
		}

		return (
			<>
				{ ! isEmpty( searchQuery ) && ! hasAPIResults && (
					<p className="inline-help__empty-results">{
						translate( 'Sorry, there were no matches. Here are some of the most searched for help pages for this section:'
						) }
					</p>
				) }

				<ul className="inline-help__results-list">
					{ searchResults.map( renderHelpLink ) }
				</ul>
			</>
		);
	};

	return (
		<>
			<QueryInlineHelpSearch query={ searchQuery } />
			{ renderSearchResults() }
		</>
	);
}

HelpSearchResults.propTypes = {
	translate: PropTypes.func,
	searchQuery: PropTypes.string,
	onSelect: PropTypes.func.isRequired,
	hasAPIResults: PropTypes.bool,
	searchResults: PropTypes.array,
	selectedResultIndex: PropTypes.number,
	isSearching: PropTypes.bool,
};

export default connect(
	( state, ownProps ) => ( {
		searchResults: getSearchResultsByQuery( state ),
		isSearching: isRequestingInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
		selectedResultIndex: getSelectedResultIndex( state ),
		hasAPIResults: hasInlineHelpAPIResults( state ),
	} ),
	{
		recordTracksEvent,
		selectSearchResult: selectResult,
	}
)( localize( HelpSearchResults ) );
