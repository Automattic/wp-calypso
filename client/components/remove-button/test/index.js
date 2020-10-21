/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import Gridicon from 'calypso/components/gridicon';
import { identity, noop } from 'lodash';
import React from 'react';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { RemoveButton } from '../index';
import { Button } from '@automattic/components';

describe( 'Remove Button', () => {
	test( 'should render the button', () => {
		const wrapper = shallow( <RemoveButton onRemove={ noop } translate={ identity } /> );

		expect( wrapper ).to.have.className( 'remove-button' );
	} );

	test( 'should render the icon', () => {
		const wrapper = shallow( <RemoveButton onRemove={ noop } translate={ identity } /> );

		expect( wrapper.find( Gridicon ) ).to.have.length( 1 );
	} );

	test( 'should call the provided callback when the button is clicked', () => {
		const onRemove = spy();
		const wrapper = shallow( <RemoveButton onRemove={ onRemove } translate={ identity } /> );

		wrapper.find( Button ).simulate( 'click' );
		expect( onRemove.calledOnce ).to.equal( true );
	} );
} );
