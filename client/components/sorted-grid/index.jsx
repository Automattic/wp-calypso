/**
 * External dependencies
 */
import { get, keys, last, map, omit, reduce, slice } from 'lodash';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Label from './label';
import InfiniteList from 'components/infinite-list';

class SortedGrid extends PureComponent {

	static propTypes = {
		getGroupLabel: PropTypes.func.isRequired,
		getItemGroup: PropTypes.func.isRequired,
		items: PropTypes.array,
		itemsPerRow: PropTypes.number.isRequired,
	};

	getItems() {
		const items = [];

		for ( let i = 0; i < this.props.items.length; i += this.props.itemsPerRow ) {
			const row = slice( this.props.items, i, i + this.props.itemsPerRow );
			const groups = reduce( map( row, this.props.getItemGroup ), ( results, group ) => {
				results[ group ] = get( results, group, 0 ) + 1;
				return results;
			}, {} );

			items.push(
				{ isGridLabel: true, id: i, groups },
				...row
			);
		}

		return items;
	}

	renderLabels( row ) {
		return (
			<div key={ `header_${ row.id }` } className="sorted-grid__header">
				{ map( row.groups, ( count, group ) => (
					<Label
						key={ `group_${ group }` }
						text={ this.props.getGroupLabel( group ) }
						itemsCount={ count }
						itemsPerRow={ this.props.itemsPerRow }
						lastInRow={ last( keys( row.groups ) ) === group } />
				) ) }
			</div>
		);
	}

	renderItem = ( item ) => {
		if ( item.isGridLabel ) {
			return this.renderLabels( item );
		}

		return this.props.renderItem( item );
	}

	render() {
		const props = omit( this.props, 'getGroupLabel', 'getItemGroup', 'items', 'renderItem' );

		return (
			<InfiniteList
				items={ this.getItems() }
				renderItem={ this.renderItem }
				{ ...props } />
		);
	}
}

export default SortedGrid;
