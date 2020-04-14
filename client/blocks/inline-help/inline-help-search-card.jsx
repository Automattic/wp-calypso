/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { identity, includes } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal Dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import SearchCard from 'components/search-card';
import {
	getInlineHelpCurrentlySelectedLink,
	getSelectedResultIndex,
	isRequestingInlineHelpSearchResultsForQuery,
} from 'state/inline-help/selectors';
import {
	requestInlineHelpSearchResults,
	selectNextResult,
	selectPreviousResult,
} from 'state/inline-help/actions';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:inline-help' );

class InlineHelpSearchCard extends Component {
	static propTypes = {
		openResult: PropTypes.func.isRequired,
		translate: PropTypes.func,
		query: PropTypes.string,
	};

	static defaultProps = {
		translate: identity,
		query: '',
	};

	onKeyDown = event => {
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
				hasSelection && this.props.openResult( event );
				break;
			}
		}
	};

	onSearch = searchQuery => {
		debug( 'search query received: ', searchQuery );
		this.props.recordTracksEvent( 'calypso_inlinehelp_search', { search_query: searchQuery } );
		this.props.requestInlineHelpSearchResults( searchQuery );
	};

	render() {
		return (
			<SearchCard
				searching={ this.props.isSearching }
				initialValue={ this.props.query }
				onSearch={ this.onSearch }
				onKeyDown={ this.onKeyDown }
				placeholder={ this.props.translate( 'Search for help…' ) }
				delaySearch={ true }
			/>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => ( {
	isSearching: isRequestingInlineHelpSearchResultsForQuery( state, ownProps.query ),
	selectedLink: getInlineHelpCurrentlySelectedLink( state ),
	selectedResultIndex: getSelectedResultIndex( state ),
} );
const mapDispatchToProps = {
	recordTracksEvent,
	requestInlineHelpSearchResults,
	selectNextResult,
	selectPreviousResult,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelpSearchCard ) );
