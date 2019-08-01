/** @format */

/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import SegmentedControl from '.';
import ControlItem from './item';

function SimplifiedSegmentedControl( {
	options,
	initialSelected = options[ 0 ].value,
	onSelect = noop,
	...props
} ) {
	const [ selected, setSelected ] = useState( initialSelected );

	const renderedOptions = options.map( ( option, index ) => (
		<ControlItem
			index={ index }
			key={ index }
			onClick={ () => {
				setSelected( option.value );
				onSelect( option );
			} }
			path={ option.path }
			selected={ selected === option.value }
			value={ option.value }
		>
			{ option.label }
		</ControlItem>
	) );

	return <SegmentedControl { ...props }>{ renderedOptions }</SegmentedControl>;
}

SimplifiedSegmentedControl.propTypes = {
	className: PropTypes.string,
	compact: PropTypes.bool,
	primary: PropTypes.bool,
	style: PropTypes.object,
	initialSelected: PropTypes.string,
	onSelect: PropTypes.func,
	options: PropTypes.arrayOf(
		PropTypes.shape( {
			value: PropTypes.string.isRequired,
			label: PropTypes.string.isRequired,
			path: PropTypes.string,
		} )
	).isRequired,
};

export default SimplifiedSegmentedControl;
