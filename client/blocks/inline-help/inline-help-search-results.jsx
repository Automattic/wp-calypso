/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
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
	hasInlineHelpAPIResults,
} from 'state/inline-help/selectors';
import { getLastRouteAction } from 'state/ui/action-log/selectors';
import { setSearchResults, selectResult } from 'state/inline-help/actions';
import { localizeUrl } from 'lib/i18n-utils';

class InlineHelpSearchResults extends Component {
	static propTypes = {
		openResult: PropTypes.func.isRequired,
		translate: PropTypes.func,
		searchQuery: PropTypes.string,
	};

	static defaultProps = {
		translate: identity,
		searchQuery: '',
	};

	renderSearchResults() {
		if ( this.props.isSearching ) {
			// search, but no results so far
			return <PlaceholderLines />;
		}

		// found something
		const links = this.props.searchResults;

		return (
			<>
				{ ! isEmpty( this.props.searchQuery ) && ! this.props.hasAPIResults && (
					<p className="inline-help__empty-results">{ this.props.translate( 'No results.' ) }</p>
				) }
				<ul className="inline-help__results-list">{ links && links.map( this.renderHelpLink ) }</ul>
			</>
		);
	}

	onHelpLinkClick = ( selectionIndex ) => ( event ) => {
		const selectedResult = this.props.searchResults && this.props.searchResults[ selectionIndex ];
		this.props.selectResult( selectionIndex );
		this.props.openResult( event, selectedResult );
	};

	renderHelpLink = ( link, index ) => {
		const classes = { 'is-selected': this.props.selectedResultIndex === index };
		return (
			<li
				key={ link.link ? link.link : link.key }
				className={ classNames( 'inline-help__results-item', classes ) }
			>
				<a
					href={ localizeUrl( link.link ) }
					onClick={ this.onHelpLinkClick( index ) }
					title={ decodeEntities( link.description ) }
				>
					{ preventWidows( decodeEntities( link.title ) ) }
				</a>
			</li>
		);
	};

	render() {
		return (
			<div>
				<QueryInlineHelpSearch
					query={ this.props.searchQuery }
					requesting={ this.props.isSearching }
				/>
				{ this.renderSearchResults() }
			</div>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => ( {
	lastRoute: getLastRouteAction( state ),
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

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( InlineHelpSearchResults ) );
