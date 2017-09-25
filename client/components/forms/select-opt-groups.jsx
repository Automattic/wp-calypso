/**
 * External dependencies
 */
import { omit } from 'lodash';
import React from 'react';

const SelectOptGroups = props => {
	const { optGroups, ...selectProps } = props;
	return <select { ...omit( selectProps, [ 'moment', 'numberFormat', 'translate' ] ) }>
			{ optGroups.map( optGroup =>
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
};

export default SelectOptGroups;
