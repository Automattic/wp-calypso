/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { get, identity } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import debugFactory from 'debug';

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
	getSelectedResult,
	isRequestingInlineHelpSearchResultsForQuery,
} from 'state/inline-help/selectors';
import { getLastRouteAction } from 'state/ui/action-log/selectors';
import { setSearchResults } from 'state/inline-help/actions';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:inline-help' );

class InlineHelpSuggestions extends Component {
	static propTypes = {
		openResult: PropTypes.func.isRequired,
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
				link: 'https://en.support.wordpress.com/business-plan/',
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
	};

	renderSearchResults() {
		if ( this.props.isSearching ) {
			// search, but no results so far
			return <PlaceholderLines />;
		}
		const links = this.getContextResults();
		return (
			<ul className="inline-help__results-list">{ links && links.map( this.renderHelpLink ) }</ul>
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
	};

	componentDidMount() {
		this.props.setSearchResults( '', this.getContextResults() );
	}

	onHelpLinkClick = event => {
		this.props.openResult( event, event.target.href );
	};

	renderHelpLink = ( link, index ) => {
		const classes = { 'is-selected': this.props.selectedResult === index };
		return (
			<li key={ link.link } className={ classNames( 'inline-help__results-item', classes ) }>
				<a
					href={ link.link }
					onClick={ this.onHelpLinkClick }
					title={ decodeEntities( link.description ) }
				>
					{ preventWidows( decodeEntities( link.title ) ) }
				</a>
			</li>
		);
	};

	getContextQuery = () => {
		const context = {
			path: this.props.lastRoute.path,
			section: pathToSection( this.props.lastRoute.path ),
		};
		const sectionToSearchQuery = {
			stats: 'statistics',
			media: 'media',
			checklist: 'getting started',
			sharing: 'social media',
		};
		const searchQuery = get( sectionToSearchQuery, context.section, '' );
		debug( 'InlineHelpSuggestions.getContextQuery', context, searchQuery );
		return searchQuery;
	};

	render() {
		const searchQuery = this.getContextQuery();
		return (
			<div>
				<h2>Suggestions</h2>
				<QueryInlineHelpSearch query={ searchQuery } requesting={ this.props.isSearching } />
				{ this.renderSearchResults() }
			</div>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => ( {
	lastRoute: getLastRouteAction( state ),
	searchResults: getInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
	isSearching: isRequestingInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
	selectedResult: getSelectedResult( state ),
} );
const mapDispatchToProps = {
	recordTracksEvent,
	setSearchResults,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelpSuggestions ) );
