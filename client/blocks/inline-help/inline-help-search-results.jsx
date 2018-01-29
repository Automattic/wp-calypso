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
import { tracks } from 'lib/analytics';
import QueryInlineHelpSearch from 'components/data/query-inline-help-search';
import PlaceholderLines from './placeholder-lines';
import { decodeEntities, preventWidows } from 'lib/formatting';
import {
	getInlineHelpSearchResultsForQuery,
	getSelectedResult,
	isRequestingInlineHelpSearchResultsForQuery,
	shouldOpenSelectedResult,
} from 'state/inline-help/selectors';
import { didOpenResult, setSearchResults } from 'state/inline-help/actions';

class InlineHelpSearchResults extends Component {
	static propTypes = {
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	getContextResults = () => {
		// going without context for now -- let's just provide the top x recommended links
		// copied from client/me/help/main for now
		const helpfulResults = [
			{
				link: 'https://en.support.wordpress.com/com-vs-org/',
				title: this.props.translate( 'Uploading custom plugins and themes' ),
				description: this.props.translate(
					'Learn more about installing a custom theme or plugin using the Business plan.'
				),
			},
			{
				link: 'https://en.support.wordpress.com/all-about-domains/',
				title: this.props.translate( 'All About Domains' ),
				description: this.props.translate(
					'Set up your domain whether it’s registered with WordPress.com or elsewhere.'
				),
			},
			{
				link: 'https://en.support.wordpress.com/start/',
				title: this.props.translate( 'Get Started' ),
				description: this.props.translate(
					'No matter what kind of site you want to build, our five-step checklists will get you set up and ready to publish.'
				),
			},
			{
				link: 'https://en.support.wordpress.com/settings/privacy-settings/',
				title: this.props.translate( 'Privacy Settings' ),
				description: this.props.translate(
					'Limit your site’s visibility or make it completely private.'
				),
			},
		];
		return helpfulResults;
	}

	renderSearchResults() {
		if ( isEmpty( this.props.searchQuery ) ) {
			// not searching
			return this.renderContextHelp();
		}

		if ( this.props.isSearching ) {
			// search, but no results so far
			return (
				<PlaceholderLines />
			);
		}

		if ( isEmpty( this.props.searchResults ) ) {
			// search done, but nothing found
			return (
				<div>
					<p className="inline-help__empty-results">No results.</p>
					{ this.renderContextHelp() }
				</div>
			);
		}

		// found something
		const links = this.props.searchResults;
		return (
			<ul className="inline-help__results-list">{ links && links.map( this.renderHelpLink ) }</ul>
		);
	}

	renderContextHelp() {
		const links = this.getContextResults();
		return (
			<ul className="inline-help__results-list">
				{ links && links.map( this.renderHelpLink ) }
			</ul>
		);
	}

	getSelectedUrl = () => {
		if ( this.props.selectedResult === -1 ) {
			return false;
		}

		const links = this.props.searchResults || this.getContextResults();
		const selectedLink = links[ this.props.selectedResult ];
		if ( ! selectedLink || ! selectedLink.link ) {
			return false;
		}
		return selectedLink.link;
	}

	componentWillUpdate( nextProps ) {
		if ( nextProps.shouldOpenSelectedResult ) {
			const url = this.getSelectedUrl();
			this.followHelpLink( url );
			this.props.didOpenResult();
			window.location = url;
			return;
		}
		if ( isEmpty( nextProps.searchResults ) ) {
			this.setContextResults();
		}
	}

	componentDidMount() {
		if ( isEmpty( this.props.searchResults ) ) {
			this.setContextResults();
		}
	}

	setContextResults = () => {
		this.props.setSearchResults( this.props.searchQuery, this.getContextResults() );
	};

	followHelpLink = ( url ) => {
		const payload = {
			searchQuery: this.props.searchQuery,
			currentUrl: window.location.href,
			resultUrl: url,
		};
		return () => {
			tracks.recordEvent( 'calypso_inline-help_follow-link', payload );
		};
	}

	renderHelpLink = ( link, index ) => {
		const classes = [
			'inline-help__results-item',
			this.props.selectedResult === index && 'is-selected',
		].filter( Boolean );
		return (
			<li key={ link.link } className={ classNames( ...classes ) }>
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
		return (
			<div>
				<QueryInlineHelpSearch query={ this.props.searchQuery } requesting={ this.props.isSearching } />
				{ this.renderSearchResults() }
			</div>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	return {
		searchResults: getInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
		isSearching: isRequestingInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
		shouldOpenSelectedResult: shouldOpenSelectedResult( state ),
		selectedResult: getSelectedResult( state ),
	};
};
const mapDispatchToProps = {
	didOpenResult,
	setSearchResults,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelpSearchResults ) );
