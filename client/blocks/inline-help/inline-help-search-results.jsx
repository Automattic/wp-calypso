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
import { getNewRailcarSeed } from 'state/analytics/utils';
import QueryInlineHelpSearch from 'components/data/query-inline-help-search';
import PlaceholderLines from './placeholder-lines';
import TrackComponentView from 'lib/analytics/track-component-view';
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
		searchQuery: PropTypes.string,
	};

	static defaultProps = {
		translate: identity,
		searchQuery: '',
	};

	state = {
		railcarSeed: getNewRailcarSeed(),
	};

	componentWillReceiveProps( nextProps ) {
		if ( this.props.searchQuery !== nextProps.searchQuery ) {
			this.setState( {
				railcarSeed: getNewRailcarSeed(),
			} );
		}
	}

	componentWillUpdate( nextProps ) {
		if ( nextProps.shouldOpenSelectedResult ) {
			const url = this.getSelectedUrl();
			this.followHelpLink( url )();
			this.props.didOpenResult();
			window.location = url;
			return;
		}
	}

	componentDidMount() {
		this.props.setSearchResults( '', this.getContextResults() );
	}

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

	isShowingSuggestions = () => {
		return isEmpty( this.props.searchQuery ) || ( ! isEmpty( this.props.searchQuery ) && isEmpty( this.props.searchResults ) );
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

		if ( ! isEmpty( this.props.searchQuery ) && isEmpty( this.props.searchResults ) ) {
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
		if ( links && links.length > 0 ) {
			return (
				<ul className="inline-help__results-list">{ links && links.map( this.renderHelpLink ) }</ul>
			);
		}
		return null;
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

	followHelpLink = ( url, index ) => {
		const railcar = this.getRailcarForIndex( index );
		return () => {
			// TrainTracks interact event
			this.props.recordTracksEvent( 'calypso_traintracks_interact', {
				action: 'calypso_inlinehelp_link_open',
				railcar: railcar,
			} );
			// regular Tracks event
			this.props.recordTracksEvent( 'calypso_inlinehelp_link_open', {
				search_query: this.props.searchQuery,
				current_url: window.location.href,
				result_url: url,
			} );
		};
	}

	renderHelpLink = ( link, index ) => {
		// TrainTracks render event
		const eventProperties = {
			railcar: this.getRailcarForIndex( index ),
			fetch_algo: this.isShowingSuggestions() ? 'suggest_top4_static' : 'search_top4_classic',
			fetch_position: index,
			ui_algo: 'as_fetched',
			ui_position: index,
			fetch_query: this.props.searchQuery,
		};

		const classes = { 'is-selected': this.props.selectedResult === index };
		return (
			<li key={ link.link } className={ classNames( 'inline-help__results-item', classes ) }>
				<a
					href={ link.link }
					onClick={ this.followHelpLink( link.link, index ) }
					title={ decodeEntities( link.description ) }
				>
					{ preventWidows( decodeEntities( link.title ) ) }
					<TrackComponentView eventName="calypso_traintracks_render" eventProperties={ eventProperties } />
				</a>
			</li>
		);
	}

	getRailcarForIndex( index ) {
		return this.state.railcarSeed + '-inlinehelp-search-' + index;
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

const mapStateToProps = ( state, ownProps ) => ( {
	searchResults: getInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
	isSearching: isRequestingInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
	shouldOpenSelectedResult: shouldOpenSelectedResult( state ),
	selectedResult: getSelectedResult( state ),
} );
const mapDispatchToProps = {
	didOpenResult,
	recordTracksEvent,
	setSearchResults,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelpSearchResults ) );
