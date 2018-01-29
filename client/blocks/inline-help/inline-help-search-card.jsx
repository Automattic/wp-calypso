/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';

/**
 * Internal Dependencies
 */
import SearchCard from 'components/search-card';
import { isRequestingInlineHelpSearchResultsForQuery } from 'state/inline-help/selectors';

class InlineHelpSearchCard extends Component {
	static propTypes = {
		translate: PropTypes.func,
		query: PropTypes.string,
	};

	static defaultProps = {
		translate: identity,
		query: '',
	};

	render() {
		return (
			<SearchCard
				searching={ this.props.isSearching }
				initialValue={ this.props.query }
				onSearch={ this.props.onSearch }
				onKeyDown={ this.props.onKeyDown }
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
const mapDispatchToProps = null;
export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelpSearchCard ) );
