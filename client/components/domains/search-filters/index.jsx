/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { pick, noop } from 'lodash';

/**
 * Internal dependencies
 */

import MoreFiltersControl from './more-filters';

export default class SearchFilters extends Component {
	static propTypes = {
		filters: PropTypes.shape( {
			excludeDashes: PropTypes.bool,
			maxCharacters: PropTypes.number,
			showExactMatchesOnly: PropTypes.bool,
		} ).isRequired,
		onChange: PropTypes.func,
		onFiltersReset: PropTypes.func,
		onFiltersSubmit: PropTypes.func,
	};

	static defaultProps = {
		onChange: noop,
		onFiltersReset: noop,
		onFiltersSubmit: noop,
	};

	updateFilterValues = ( name, value ) => {
		const newFilters = {
			...this.props.filters,
			[ name ]: value,
		};
		this.props.onChange( newFilters );
	};

	render() {
		return (
			<div className="search-filters">
				<MoreFiltersControl
					{ ...pick( this.props.filters, [
						'excludeDashes',
						'maxCharacters',
						'showExactMatchesOnly',
						'onFiltersReset',
					] ) }
					onChange={ this.updateFilterValues }
					{ ...pick( this.props, [ 'onFiltersReset', 'onFiltersSubmit' ] ) }
				/>
			</div>
		);
	}
}
