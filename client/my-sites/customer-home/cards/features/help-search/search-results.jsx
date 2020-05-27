/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { identity, isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal Dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import QueryInlineHelpSearch from 'components/data/query-inline-help-search';
import PlaceholderLines from './placeholder-lines';
import { decodeEntities, preventWidows } from 'lib/formatting';
import {
	getInlineHelpSearchResultsForQuery,
	getSelectedResultIndex,
	isRequestingInlineHelpSearchResultsForQuery,
} from 'state/inline-help/selectors';

import hasInlineHelpAPIResults from 'state/selectors/has-inline-help-api-results';

import { setSearchResults, selectResult } from 'state/inline-help/actions';
import { localizeUrl } from 'lib/i18n-utils';

function HelpSearchResults( props ) {
	const {
		translate = identity,
		searchQuery = '',
		hasAPIResults = false,
		searchResults = [],
		selectedResultIndex = -1,
		isSearching = false,
	} = props;

	const onHelpLinkClick = ( selectionIndex ) => ( event ) => {
		const selectedResult = searchResults?.[ selectionIndex ] ?? null;
		props.selectResult( selectionIndex );
		props.openResult( event, selectedResult );
	};

	const renderHelpLink = ( link, index ) => {
		const classes = { 'is-selected': selectedResultIndex === index };
		return (
			<li
				key={ link.link ? link.link : link.key }
				className={ classNames( 'help-search__results-item', classes ) }
			>
				<a
					href={ localizeUrl( link.link ) }
					onClick={ onHelpLinkClick( index ) }
					title={ decodeEntities( link.description ) }
				>
					{ preventWidows( decodeEntities( link.title ) ) }
				</a>
			</li>
		);
	};

	const renderSearchResults = () => {
		if ( isSearching ) {
			// search, but no results so far
			return <PlaceholderLines />;
		}

		// found something
		const links = searchResults;

		return (
			<>
				{ ! isEmpty( searchQuery ) && ! hasAPIResults && (
					<p className="help-search__empty-results">{ translate( 'No results.' ) }</p>
				) }
				<ul className="help-search__results-list">{ links && links.map( renderHelpLink ) }</ul>
			</>
		);
	};

	return (
		<div>
			<QueryInlineHelpSearch query={ searchQuery } requesting={ props.isSearching } />
			{ renderSearchResults() }
		</div>
	);
}

HelpSearchResults.propTypes = {
	translate: PropTypes.func,
	searchQuery: PropTypes.string,
	openResult: PropTypes.func.isRequired,
	hasAPIResults: PropTypes.bool,
	searchResults: PropTypes.array,
	selectedResultIndex: PropTypes.number,
	isSearching: PropTypes.bool,
};

const mapStateToProps = ( state, ownProps ) => ( {
	searchResults: getInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
	isSearching: isRequestingInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
	selectedResultIndex: getSelectedResultIndex( state ),
	hasAPIResults: hasInlineHelpAPIResults( state ),
} );
const mapDispatchToProps = {
	recordTracksEvent,
	setSearchResults,
	selectResult,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( HelpSearchResults ) );
