/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { spy } from 'sinon';
import { identity, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { RemoveButton } from '../index';

describe( 'Remove Button', function() {
	it( 'should render the button', () => {
		const wrapper = shallow( <RemoveButton onRemove={ noop } translate={ identity } /> );

		expect( wrapper ).to.have.className( 'remove-button' );
	} );

	it( 'should render the icon', () => {
		const wrapper = shallow( <RemoveButton onRemove={ noop } translate={ identity } /> );

		expect( wrapper.find( Gridicon ) ).to.have.length( 1 );
	} );

	it( 'should call the provided callback when the button is clicked', () => {
		const onRemove = spy();
		const wrapper = shallow( <RemoveButton onRemove={ onRemove } translate={ identity } /> );

		wrapper.find( Button ).simulate( 'click' );
		expect( onRemove.calledOnce ).to.equal( true );
	} );
} );
