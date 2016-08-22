/**
 * External dependencies
 */
import React, { Component } from 'react';
import { omit } from 'lodash';
const debug = require( 'debug' )( 'calypso:forms:select-opt-groups' );

export default class SelectOptGroups extends Component {

	componentWillMount() {
		debug( 'Mounting SelectOptGroups React component.' );
	}

	render() {
		return (
			<select { ...omit( this.props, 'optGroups' ) }>
				{ this.props.optGroups.map( optGroup =>
					<optgroup label={ optGroup.label } key={ `optgroup-${optGroup.label}` } >
						{ optGroup.options.map( option =>
							<option
								value={ option.value }
								key={ `option-${optGroup.label}${option.label}` }
							>
								{ option.label }
							</option>
						) }
					</optgroup>
				) }
			</select>
		);
	}

}
