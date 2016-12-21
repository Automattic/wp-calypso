/**
 * External Dependencies
 */

import React, { PropTypes, PureComponent } from 'react';

import TableRow from './table-row';

class Table extends PureComponent {

	/**
	 * Returns a function to be called when a row updates the current value
	 * @param {string} name The name of the prop that will be updated
	 * @param {string} type The type of the prop that will be update
	 * @return {function} A function to be used in a row's callback
	 */
	updated = ( name, type ) => ( value ) => {
		if ( this.props.onUpdate ) {
			this.props.onUpdate( type, name, value );
		}
	};

	render() {
		return (
			<div className="props-editor__table-container">
				<table className="props-editor__table">
					<thead>
					<tr>
						<th>Prop</th>
						<th>Type</th>
						<th>Required?</th>
						<th>Current Value</th>
						<th>Default Value</th>
						<th>Description</th>
					</tr>
					</thead>
					<tbody>
					{
						this.props.props.map( ( prop ) =>
							<TableRow
								onChange={ this.updated( prop.name, prop.type ) }
								key={ prop.name }
								{ ...prop }
							/> )
					}
					</tbody>
				</table>
			</div>
		);
	}
}

Table.propTypes = {
	/**
	 * An array of props
	 */
	props: PropTypes.arrayOf( PropTypes.object ),

	/**
	 * Function called whenever a prop's current value changes
	 */
	onUpdate: PropTypes.func
};

export default Table;
