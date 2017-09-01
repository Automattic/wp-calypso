/**
 * External Dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import Gridicon from 'gridicons';

class Row extends PureComponent {
	static propTypes = {
		component: PropTypes.object.isRequired,
		propName: PropTypes.string.isRequired
	};

	render() {
		const prop = this.props.component.props[ this.props.propName ];
		let type = 'unknown';
		if ( prop.type ) {
			switch ( prop.type.name ) {
				default:
					type = prop.type.name;
					break;
				case 'arrayOf':
				case 'oneOf':
				case 'oneOfType':
				case 'objectOf':
				case 'instanceOf':
					type = `${ prop.type.name }( ${ prop.type.value.name || 'unknown' } )`;
					break;
			}
		}

		return (
			<tr>
				<td>{ prop.required ? <Gridicon icon="checkmark" /> : <Gridicon icon="cross-small" /> }</td>
				<td>{ this.props.propName }</td>
				<td>{ type }</td>
				<td>{ prop.defaultValue ? prop.defaultValue.value : 'undefined' }</td>
				<td>{ prop.description }</td>
			</tr>
		);
	}
}

export default Row;
