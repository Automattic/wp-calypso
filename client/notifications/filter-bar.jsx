import React from 'react';
import classNames from 'classnames';
import {
	always,
	compose,
	partial,
	pick,
	prop,
	propEq,
	propOr
} from 'ramda';

const onlyFilters = compose( propEq( 'name', 'Filter' ), prop( 'type' ) );
const filterExtractor = compose( pick( [ 'name', 'filter' ] ), prop( 'props' ) );

export const Filter = ( { isSelected, name, onClick } ) =>
	<li className={ classNames( { isSelected } ) } { ...{ onClick } }>{ name }</li>;

export const FilterBar = state => React.createClass( {
	componentWillMount() {
		this.updateFilterList();
	},

	componentWillUpdate() {
		this.updateFilterList();
	},

	updateFilterList() {
		const { children } = this.props;

		state.filters = React.Children.toArray( children )
			.filter( onlyFilters )
			.map( filterExtractor );
	},

	render() {
		const {
			selectedFilter,
			selectFilter
		} = this.props;
		const { filters } = state;

		return (
			<ul className="notifications__filter-bar">
				{ filters.map( ( { name }, key ) => (
					<Filter
						isSelected={ selectedFilter === name }
						onClick={ partial( selectFilter, [ name ] ) }
						{ ...{ key, name } }
					/>
				) ) }
			</ul>
		);
	}
} );

const FilterBarFactory = () => {
	const state = {
		filters: []
	};

	const getFilter = name => propOr(
		always( true ),
		'filter',
		state.filters.find( propEq( 'name', name ) )
	);

	return {
		FilterBar: FilterBar( state ),
		getFilter
	};
};

export default FilterBarFactory;
