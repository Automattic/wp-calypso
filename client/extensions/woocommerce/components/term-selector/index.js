/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import AddTerm from './add-term';
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
		const { taxonomy, postType, onAddTerm, setWithDimensionsRef } = this.props;
		const { search } = this.state;
		const query = {};
		if ( search && search.length ) {
			query.search = search;
		}
		return (
			<Fragment>
				<div className="term-selector__dimensions" ref={ setWithDimensionsRef } />
				<TermTreeSelectorTerms
					{ ...omit( this.props, 'setWithDimensionsRef', 'height', 'showAddTerm', 'onAddTerm' ) }
					height={ 300 }
					query={ query }
					onSearch={ this.onSearch }
				/>
				{ this.props.showAddTerm && (
					<AddTerm postType={ postType } taxonomy={ taxonomy } onSuccess={ onAddTerm } />
				) }
			</Fragment>
		);
	}
}

TermSelector.propTypes = {
	hideTermAndChildren: PropTypes.number,
	showAddTerm: PropTypes.bool,
	onAddTerm: PropTypes.func,
	terms: PropTypes.array,
	postType: PropTypes.string,
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
