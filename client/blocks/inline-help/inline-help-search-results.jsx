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
import ContextHelpResults from './context-help-results';
import PlaceholderLines from './placeholder-lines';
import { decodeEntities, preventWidows } from 'lib/formatting';
import {
	getInlineHelpSearchResultsForQuery,
	getSelectedResult,
	isRequestingInlineHelpSearchResultsForQuery,
	shouldOpenSelectedResult,
	shouldOpenSelectedContextLink,
} from 'state/inline-help/selectors';
import { didOpenResult, didOpenContextLink } from 'state/inline-help/actions';

class InlineHelpSearchResults extends Component {
	static propTypes = {
		translate: PropTypes.func,
		searchQuery: PropTypes.string,
	};

	static defaultProps = {
		translate: identity,
		searchQuery: '',
	};

	getSelectedUrl = () => {
		if ( this.props.selectedResult === -1 ) {
			return false;
		}

		const selectedLink = this.props.searchResults[ this.props.selectedResult ];
		if ( ! selectedLink || ! selectedLink.link ) {
			return false;
		}
		return selectedLink.link;
	}

	componentWillUpdate( nextProps ) {
		console.log( 'componentWillUpdate' );
		if ( nextProps.shouldOpenSelectedResult ) {
			console.log( 'nextProps.shouldOpenSelectedResult' );
			const url = this.getSelectedUrl();
			if ( ! url ) {
				return;
			}
			this.followHelpLink( url )();
			this.props.didOpenResult();
			window.location = url;
			return;
		}
		if ( nextProps.shouldOpenSelectedContextLink ) {
			console.log( 'nextProps.shouldOpenSelectedContextLink' );
			const url = this.getSelectedUrl(); // make specific to context links
			if ( ! url ) {
				return;
			}
			this.followHelpLink( url )();
			this.props.didOpenContextLink();
			window.location = url;
			return;
		}
	}

	followHelpLink = ( url ) => {
		const payload = {
			search_query: this.props.searchQuery,
			result_url: url,
		};
		return () => {
			this.props.recordTracksEvent( 'calypso_inlinehelp_link_open', payload );
		};
	}

	renderHelpLink = ( link, index ) => {
		const classes = { 'is-selected': this.props.selectedResult === index };
		return (
			<li key={ link.link } className={ classNames( 'inline-help__results-item', classes ) }>
				<a
					href={ link.link }
					onClick={ this.followHelpLink( link.link ) }
					title={ decodeEntities( link.description ) }
				>
					{ preventWidows( decodeEntities( link.title ) ) }
				</a>
			</li>
		);
	}

	render() {
		// TODO: do we need query here, everywhere? or just in a few places? or maybe in the parent component?
		const query = <QueryInlineHelpSearch query={ this.props.searchQuery } requesting={ this.props.isSearching } />;
		if ( isEmpty( this.props.searchQuery ) ) {
			// not searching
			return (
				<div>
					{ query }
					<ContextHelpResults context={ { url: window.location } } />
				</div>
			);
		}

		if ( this.props.isSearching ) {
			// search, but no results so far
			return (
				<div>
					{ query }
					<PlaceholderLines />
				</div>
			);
		}

		if ( isEmpty( this.props.searchResults ) && ! isEmpty( this.props.searchQuery ) ) {
			// search done, but nothing found
			return (
				<div>
					{ query }
					<p className="inline-help__empty-results">No results.</p>
					<ContextHelpResults />
				</div>
			);
		}

		const links = this.props.searchResults;
		if ( links && links.length > 0 ) {
			// found something
			return (
				<div>
					{ query }
					<ul className="inline-help__results-list">{ links && links.map( this.renderHelpLink ) }</ul>
				</div>
			);
		}
		return null;
	}
}

const mapStateToProps = ( state, ownProps ) => ( {
	searchResults: getInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
	isSearching: isRequestingInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
	shouldOpenSelectedResult: shouldOpenSelectedResult( state ),
	shouldOpenSelectedContextLink: shouldOpenSelectedContextLink( state ),
	selectedResult: getSelectedResult( state ),
} );
const mapDispatchToProps = {
	didOpenResult,
	didOpenContextLink,
	recordTracksEvent,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelpSearchResults ) );
