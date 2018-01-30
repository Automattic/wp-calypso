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
import SearchCard from 'components/search-card';
import { isRequestingInlineHelpSearchResultsForQuery } from 'state/inline-help/selectors';
import { openResult, selectNextResult, selectPreviousResult } from 'state/inline-help/actions';

class InlineHelpSearchCard extends Component {
	static propTypes = {
		translate: PropTypes.func,
		query: PropTypes.string,
	};

	static defaultProps = {
		translate: identity,
		query: '',
	};

	onKeyDown = event => {
		// ignore keyboard access when manipulating a text selection in input
		if ( event.getModifierState() ) {
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
			case 'Enter':
				this.props.openResult();
				break;
		}
	};

	render() {
		return (
			<SearchCard
				searching={ this.props.isSearching }
				initialValue={ this.props.query }
				onSearch={ this.props.onSearch }
				onKeyDown={ this.onKeyDown }
				placeholder={ this.props.translate( 'Search for help…' ) }
				autoFocus // eslint-disable-line jsx-a11y/no-autofocus
				delaySearch={ true } />
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	return {
		isSearching: isRequestingInlineHelpSearchResultsForQuery( state, ownProps.query ),
	};
};
const mapDispatchToProps = {
	selectNextResult,
	selectPreviousResult,
	openResult,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelpSearchCard ) );
