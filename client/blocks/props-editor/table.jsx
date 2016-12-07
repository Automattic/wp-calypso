/**
 * External Dependencies
 */

import React, { PureComponent } from 'react';

import TableRow from './table-row';

class Table extends PureComponent {

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

export default Table;
