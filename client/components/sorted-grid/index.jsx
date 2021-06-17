/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { get, keys, last, map, omit, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import InfiniteList from 'calypso/components/infinite-list';
import Label from './label';

/**
 * Style dependencies
 */
import './style.scss';

class SortedGrid extends PureComponent {
	static propTypes = {
		getGroupLabel: PropTypes.func.isRequired,
		getItemGroup: PropTypes.func.isRequired,
		items: PropTypes.array,
		itemsPerRow: PropTypes.number.isRequired,
		isMobile: PropTypes.bool,
	};

	getItems() {
		const items = [];

		for ( let i = 0; i < this.props.items.length; i += this.props.itemsPerRow ) {
			const row = this.props.items.slice( i, i + this.props.itemsPerRow );
			const groups = reduce(
				map( row, this.props.getItemGroup ),
				( results, group ) => {
					results[ group ] = get( results, group, 0 ) + 1;
					return results;
				},
				{}
			);

			items.push( { isGridLabel: true, id: i, groups }, ...row );
		}

		return items;
	}

	renderLabels( row ) {
		return (
			<div key={ `header_${ row.id }` } className="sorted-grid__header">
				{ map( row.groups, ( count, group ) => {
					const labelText = this.props.getGroupLabel( group );
					return (
						'' !== labelText && (
							<Label
								key={ `group_${ group }` }
								text={ this.props.getGroupLabel( group ) }
								itemsCount={ count }
								itemsPerRow={ this.props.itemsPerRow }
								lastInRow={ last( keys( row.groups ) ) === group }
								isMobile={ this.props.isMobile }
							/>
						)
					);
				} ) }
			</div>
		);
	}

	renderItem = ( item ) => {
		if ( item.isGridLabel ) {
			return this.renderLabels( item );
		}

		return this.props.renderItem( item );
	};

	render() {
		const props = omit(
			this.props,
			'getGroupLabel',
			'getItemGroup',
			'items',
			'renderItem',
			'isMobile'
		);

		return <InfiniteList items={ this.getItems() } renderItem={ this.renderItem } { ...props } />;
	}
}

export default SortedGrid;
