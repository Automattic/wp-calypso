/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import Card from 'components/card';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ListHeader from './list-header';
import ListRow from './list-row';

export function createRenderHelpers(
	currencySymbol,
	currencyIsPrefix,
	currencyDecimals,
	numberFormat,
	translate,
	data
) {
	return {
		currencySymbol,
		currencyIsPrefix,
		currencyDecimals,
		numberFormat,
		translate,
		data,
	};
}

export default class ListTable extends React.Component {
	static propTypes = {
		products: PropTypes.array.isRequired,
		edits: PropTypes.object,
		editable: PropTypes.bool.isRequired,
		disabled: PropTypes.bool.isRequired,
		columns: PropTypes.array.isRequired,
		columnSelections: PropTypes.object.isRequired,
		renderHelpers: PropTypes.object.isRequired,
	}

	constructor( props ) {
		super( props );

		this.isColumnSelected = this.isColumnSelected.bind( this );
	}

	isColumnSelected( { key } ) {
		const { columnSelections } = this.props;

		// Iterate through all the selections and see if it's included.
		for ( const selectionKey in columnSelections ) {
			const selection = columnSelections[ selectionKey ];

			if ( selection.hasOwnProperty( 'columnKeys' ) ) {
				if ( selection.columnKeys.includes( key ) ) {
					// It's in a selection's columnKeys
					return true;
				}
			} else if ( key === selection.key ) {
				// It's a simple selection (without columnKeys)
				return true;
			}
		}
		return false;
	}

	render() {
		const {
			products,
			edits,
			editable,
			disabled,
			columns,
			onEdit,
			renderHelpers
		} = this.props;

		// Pass down a complete set of selected columns to children components.
		// Do the filtering once here and make use of it many times.
		const selectedColumns = columns.filter( this.isColumnSelected );

		// Copy all props and pass down to ListHeader for extension reasons.
		const headerProps = Object.assign( {}, this.props, { selectedColumns } );

		const cardClasses = classNames(
			'product-list__list-table',
			'product-list__list-table-columns-' + columns.length
		);

		return (
			<Card className={ cardClasses }>
				<ul className="product-list__list">
					<ListHeader ref="listHeader" { ...headerProps } />
					{
						products.map( ( data ) => this.renderRow(
							data,
							edits,
							selectedColumns,
							editable,
							disabled,
							onEdit,
							renderHelpers
						) )
					}
				</ul>
			</Card>
		);
	}

	renderRow( data, edits, selectedColumns, editable, disabled, onEdit, renderHelpers ) {
		// Check if there are edits on this data and show that instead.
		const updates = edits && edits.update;
		// TODO: A generic List Table implementation can't assume a unique ID.
		const updatedData = updates && updates.find( ( el ) => el.id === data.id );

		if ( updatedData ) {
			data = Object.assign( {}, data, updatedData );
		}

		return (
			<ListRow
				key={ data.id }
				selectedColumns={ selectedColumns }
				data={ data }
				editable={ editable }
				disabled={ disabled }
				onEdit={ onEdit }
				renderHelpers={ renderHelpers }
			/>
		);
	}
}

