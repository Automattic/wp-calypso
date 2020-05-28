/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { identity, includes } from 'lodash';

/**
 * Internal Dependencies
 */
import { recordTracksEvent, withAnalytics, composeAnalytics } from 'state/analytics/actions';
import SearchCard from 'components/search-card';
import {
	getInlineHelpCurrentlySelectedLink,
	getSelectedResultIndex,
	isRequestingInlineHelpSearchResultsForQuery,
	getInlineHelpCurrentlySelectedResult,
} from 'state/inline-help/selectors';
import {
	requestInlineHelpSearchResults,
	selectNextResult,
	selectPreviousResult,
} from 'state/inline-help/actions';

class HelpSearchCard extends Component {
	static propTypes = {
		openResult: PropTypes.func.isRequired,
		translate: PropTypes.func,
		query: PropTypes.string,
	};

	static defaultProps = {
		translate: identity,
		query: '',
	};

	onKeyDown = ( event ) => {
		// ignore keyboard access when manipulating a text selection in input etc.
		if ( event.getModifierState( 'Shift' ) ) {
			return;
		}
		// take over control if and only if it's one of our keys
		if ( includes( [ 'ArrowUp', 'ArrowDown', 'Enter' ], event.key ) ) {
			event.preventDefault();
		} else {
			return;
		}

		switch ( event.key ) {
			case 'ArrowUp':
				this.props.selectPreviousResult();
				break;
			case 'ArrowDown':
				this.props.selectNextResult();
				break;
			case 'Enter': {
				const hasSelection = this.props.selectedResultIndex >= 0;
				hasSelection && this.props.openResult( event, this.props.selectedResult );
				break;
			}
		}
	};

	onSearch = ( searchQuery ) => {
		if ( ! searchQuery || ! searchQuery.trim().length ) {
			// Make an empty search.
			this.props.requestInlineHelpSearchResults( searchQuery );
		}
		this.props.requestInlineSearchResultsAndTrack( searchQuery );
	};

	componentDidMount() {
		this.props.requestInlineSearchResultsAndTrack();
	}

	render() {
		return (
			<SearchCard
				searching={ this.props.isSearching }
				initialValue={ this.props.query }
				onSearch={ this.onSearch }
				onKeyDown={ this.onKeyDown }
				placeholder={ this.props.translate( 'Search support articles' ) }
				delaySearch={ true }
			/>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => ( {
	isSearching: isRequestingInlineHelpSearchResultsForQuery( state, ownProps.query ),
	selectedLink: getInlineHelpCurrentlySelectedLink( state ),
	selectedResultIndex: getSelectedResultIndex( state ),
	selectedResult: getInlineHelpCurrentlySelectedResult( state ),
} );

const requestInlineSearchResultsAndTrack = ( searchQuery ) =>
	withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_inlinehelp_search', {
				search_query: searchQuery,
				location: 'customer-home',
			} )
		),
		requestInlineHelpSearchResults( searchQuery )
	);

const mapDispatchToProps = {
	recordTracksEvent,
	requestInlineSearchResultsAndTrack,
	selectNextResult,
	selectPreviousResult,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( HelpSearchCard ) );
