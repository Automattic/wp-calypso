/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { filter, startsWith } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';

class FilteredList extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			filter: '',
		};
	}

	render() {
		const { items, placeholder, customFilter, filterBy, renderItem, className } = this.props;

		const onFilterChange = ( event ) => this.setState( { filter: event.target.value } );
		const filterFunc = ( item ) => {
			if ( customFilter ) {
				return customFilter( item, this.state.filter );
			}

			return startsWith( item[ filterBy ].toLowerCase(), this.state.filter.toLowerCase() );
		};
		const itemsToRender = this.state.filter ? filter( items, filterFunc ) : items;

		return (
			<div className="filtered-list">
				<FormTextInput
					value={ this.state.filter }
					onChange={ onFilterChange }
					placeholder={ placeholder }
				/>
				<div className="filtered-list__container">
					<ul className={ classNames( 'filtered-list__list', className ) }>
						{ itemsToRender.map( renderItem ) }
					</ul>
				</div>
			</div>
		);
	}
}

FilteredList.propTypes = {
	items: PropTypes.array.isRequired,
	filterBy: PropTypes.string,
	customFilter: PropTypes.func,
	placeholder: PropTypes.string,
	renderItem: PropTypes.func.isRequired,
};

export default FilteredList;
