/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
/**
 * Internal dependencies
 */
import TermTreeSelectorTerms from 'blocks/term-tree-selector/terms';
import withDimensions from 'lib/with-dimensions';

/**
 * This is a wrapper around <TermTreeSelectorTerms>
 * which only accepts a static width. If you resize the window, the display can get warped,
 * or you can only scroll half the component. This wrapped component uses `withDimensions` to get the width of a sibling node
 * to pass along.
 */

class TermSelector extends Component {
	state = {
		search: '',
	};

	onSearch = searchTerm => {
		if ( searchTerm !== this.state.search ) {
			this.setState( {
				search: searchTerm,
			} );
		}
	};

	render() {
		const { search } = this.state;
		const query = {};
		if ( search && search.length ) {
			query.search = search;
		}

		return (
			<Fragment>
				<div className="term-selector__dimensions" ref={ this.props.setWithDimensionsRef } />
				<TermTreeSelectorTerms
					{ ...this.props }
					height={ 300 }
					query={ query }
					onSearch={ this.onSearch }
				/>
			</Fragment>
		);
	}
}

TermSelector.propTypes = {
	hideTermAndChildren: PropTypes.number,
	terms: PropTypes.array,
	taxonomy: PropTypes.string,
	multiple: PropTypes.bool,
	selected: PropTypes.array,
	search: PropTypes.string,
	siteId: PropTypes.number,
	defaultTermId: PropTypes.number,
	lastPage: PropTypes.number,
	onChange: PropTypes.func,
	isError: PropTypes.bool,
	width: PropTypes.number,
	searchThreshold: PropTypes.number,
	emptyMessage: PropTypes.string,
};

export default withDimensions( TermSelector );
