/**
 * External dependencies
 */
import React from 'react';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import FormSelect from 'calypso/components/forms/form-select';

const SelectOptGroups = ( props ) => {
	const { optGroups, ...selectProps } = props;
	return (
		<FormSelect { ...omit( selectProps, [ 'moment', 'numberFormat', 'translate' ] ) }>
			{ optGroups.map( ( optGroup ) => (
				<optgroup label={ optGroup.label } key={ `optgroup-${ optGroup.label }` }>
					{ optGroup.options.map( ( option ) => (
						<option value={ option.value } key={ `option-${ optGroup.label }${ option.label }` }>
							{ option.label }
						</option>
					) ) }
				</optgroup>
			) ) }
		</FormSelect>
	);
};

export default SelectOptGroups;
