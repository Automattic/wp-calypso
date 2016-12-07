/**
 * External dependencies
 */
import React from 'react';
import { assert } from 'chai';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import TableRow from '../table-row';

describe( 'PropsEditor.TableRow', () => {
	it( 'renders a row for a table', () => {
		const prop = {
			name: 'test',
			type: 'string',
			value: 'testString'
		};

		const wrapper = shallow( <TableRow { ...prop } /> );
		assert( prop.value, wrapper.state.value );
	} );

	it( 'can edit a value and revert it', () => {
		const prop = {
			name: 'test',
			type: 'string',
			value: 'testString'
		};

		const event = {
			target: {
				textContent: '123'
			}
		};

		const onUpdate = ( newValue ) => {
			assert( '123', newValue );
		};

		const wrapper = shallow( <TableRow { ...prop } onChange={ onUpdate } /> );
		assert( prop.value, wrapper.state.value );
		wrapper.instance().updateValue( event );
		assert( '123', wrapper.state.value );
		assert( prop.value, wrapper.state.defaultValue );
		wrapper.instance().resetValue();
		assert( prop.value, wrapper.state.value );
	} );
} );
