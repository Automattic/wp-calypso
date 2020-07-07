/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { identity, includes } from 'lodash';
import page from 'page';
import debugFactory from 'debug';

/**
 * Internal Dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import SearchCard from 'components/search-card';
import getInlineHelpCurrentlySelectedLink from 'state/inline-help/selectors/get-inline-help-currently-selected-link';
import getSelectedResultIndex from 'state/inline-help/selectors/get-selected-result-index';
import isRequestingInlineHelpSearchResultsForQuery from 'state/inline-help/selectors/is-requesting-inline-help-search-results-for-query';
import getInlineHelpCurrentlySelectedResult from 'state/inline-help/selectors/get-inline-help-currently-selected-result';
import {
	setInlineHelpSearchQuery,
	selectNextResult,
	selectPreviousResult,
} from 'state/inline-help/actions';
import { SUPPORT_TYPE_ADMIN_SECTION } from './constants';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:inline-help' );

class InlineHelpSearchCard extends Component {
	static propTypes = {
		onSelect: PropTypes.func.isRequired,
		translate: PropTypes.func,
		track: PropTypes.func,
		query: PropTypes.string,
		placeholder: PropTypes.string,
		location: PropTypes.string,
		selectedResult: PropTypes.object,
	};

	static defaultProps = {
		translate: identity,
		query: '',
		location: 'inline-help-popover',
		selectedResult: {},
	};

	constructor() {
		super( ...arguments );

		this.searchHelperHandler = this.searchHelperHandler.bind( this );
	}

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
				const { selectedResultIndex, selectedResult, query, onSelect, track } = this.props;

				// check and catch admin section links.
				const { support_type: supportType, link } = selectedResult;
				if ( supportType === SUPPORT_TYPE_ADMIN_SECTION && link ) {
					track( 'calypso_inlinehelp_admin_section_search', {
						link: link,
						search_term: query,
					} );

					// push state only if it's internal link.
					if ( ! /^http/.test( link ) ) {
						event.preventDefault();
						page( link );
					} else {
						// redirect external links.
						window.location.href = link;
					}

					return;
				}

				selectedResultIndex >= 0 && onSelect( event );
				break;
			}
		}
	};

	searchHelperHandler = ( searchQuery ) => {
		const query = searchQuery.trim();

		if ( query?.length ) {
			debug( 'search query received: ', searchQuery );
			this.props.track( 'calypso_inlinehelp_search', {
				search_query: searchQuery,
				location: this.props.location,
			} );
		}

		// Set the query search
		this.props.setInlineHelpSearchQuery( searchQuery );
	};

	render() {
		return (
			<SearchCard
				searching={ this.props.isSearching }
				initialValue={ this.props.query }
				onSearch={ this.searchHelperHandler }
				onKeyDown={ this.onKeyDown }
				placeholder={ this.props.placeholder || this.props.translate( 'Search for help…' ) }
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
const mapDispatchToProps = {
	track: recordTracksEvent,
	setInlineHelpSearchQuery,
	selectNextResult,
	selectPreviousResult,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelpSearchCard ) );
