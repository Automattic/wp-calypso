/**
 * External dependencies
 */
import React from 'react';
import { omit } from 'lodash';

const SelectOptGroups = props =>
	<select { ...omit( props, [ 'optGroups', 'moment', 'numberFormat', 'translate' ] ) }>
		{ props.optGroups.map( optGroup =>
			<optgroup label={ optGroup.label } key={ `optgroup-${ optGroup.label }` } >
				{ optGroup.options.map( option =>
					<option
						value={ option.value }
						key={ `option-${ optGroup.label }${ option.label }` }
					>
						{ option.label }
					</option>
				) }
			</optgroup>
		) }
	</select>;

export default SelectOptGroups;
