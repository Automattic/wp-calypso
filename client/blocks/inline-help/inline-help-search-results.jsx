/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { identity, isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import page from 'page';

/**
 * Internal Dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import pathToSection from 'lib/path-to-section';
import QueryInlineHelpSearch from 'components/data/query-inline-help-search';
import PlaceholderLines from './placeholder-lines';
import { decodeEntities, preventWidows } from 'lib/formatting';
import {
	getInlineHelpSearchResultsForQuery,
	getSelectedResultIndex,
	isRequestingInlineHelpSearchResultsForQuery,
} from 'state/inline-help/selectors';
import { getLastRouteAction } from 'state/ui/action-log/selectors';
import { setSearchResults, selectResult } from 'state/inline-help/actions';
import { getContextResults } from './contextual-help';
import { getAdminSectionsResults } from './admin-sections';
import { localizeUrl } from 'lib/i18n-utils';
import { getSiteSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

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
		const { isSearching, searchQuery, searchResults } = this.props;

		if ( isEmpty( searchQuery ) ) {
			// not searching
			return this.renderContextHelp();
		}

		if ( isSearching ) {
			// search, but no results so far
			return <PlaceholderLines />;
		}

		return (
			<div className="inline-help__search-results">
				<h2 className="inline-help__view-heading">Support documentation:</h2>
				{ isEmpty( searchResults ) ? (
					<>
						<p className="inline-help__empty-results">
							Sorry, there were no matches. Here are some of the most searched after help pages for
							this section:
						</p>
						{ this.renderContextHelp() }
					</>
				) : (
					<ul className="inline-help__results-list">
						{ searchResults && searchResults.map( this.renderHelpLink ) }
					</ul>
				) }
			</div>
		);
	}

	renderHelpLink = ( link, index ) => {
		const classes = { 'is-selected': this.props.selectedResultIndex === index };
		const onClick =
			link.type === 'internal' ? this.onInternalLinkClick : this.onHelpLinkClick( index );
		return (
			<li
				key={ link.link ? link.link : link.key }
				className={ classNames( 'inline-help__results-item', classes ) }
			>
				<a
					href={ localizeUrl( link.link ) }
					onClick={ onClick }
					title={ decodeEntities( link.description ) }
				>
					{ preventWidows( decodeEntities( link.title ) ) }
				</a>
			</li>
		);
	};

	renderAdminSectionResults() {
		if ( ! this.props.siteSlug || isEmpty( this.props.searchQuery ) ) {
			return;
		}

		const results = getAdminSectionsResults(
			this.props.searchQuery,
			this.props.siteId,
			this.props.siteSlug
		);

		if ( isEmpty( results ) ) {
			return;
		}

		return (
			<div className="inline-help__find-section">
				<h2 className="inline-help__view-heading">Go to directly to:</h2>
				<ul className="inline-help__results-list">
					{ results && results.map( this.renderHelpLink ) }
				</ul>
			</div>
		);
	}

	renderContextHelp() {
		const section = pathToSection( this.props.lastRoute.path );
		const links = getContextResults( section );
		return (
			<ul className="inline-help__results-list">{ links && links.map( this.renderHelpLink ) }</ul>
		);
	}

	componentDidMount() {
		const section = pathToSection( this.props.lastRoute.path );
		this.props.setSearchResults( '', getContextResults( section ) );
	}

	onHelpLinkClick = selectionIndex => event => {
		this.props.selectResult( selectionIndex );
		this.props.openResult( event );
	};

	onInternalLinkClick = ( { target: { href } } ) => href && page( href );

	render() {
		return (
			<div>
				<QueryInlineHelpSearch
					query={ this.props.searchQuery }
					requesting={ this.props.isSearching }
				/>
				{ this.renderSearchResults() }
				{ this.renderAdminSectionResults() }
			</div>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => ( {
	lastRoute: getLastRouteAction( state ),
	searchResults: getInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
	isSearching: isRequestingInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
	selectedResultIndex: getSelectedResultIndex( state ),
	siteSlug: getSiteSlug( state, getSelectedSiteId( state ) ),
	siteId: getSelectedSiteId( state ),
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
