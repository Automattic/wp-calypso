/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import CustomTreeSelector from '../';
import CustomTreeNode from '../custom-tree-node';
import { node1, node3 } from './fixtures/nodes';

describe( 'CustomTreeSelector', () => {
	test( 'should render 3 placeholder nodes', () => {
		const wrapper = shallow( <CustomTreeSelector /> );
		expect( wrapper.find( '.custom-tree-selector' ) ).to.have.length( 1 );
		expect( wrapper.find( '.custom-tree-selector__placeholder' ) ).to.have.length( 3 );
	} );

	test( 'should render no placeholders when given nodes', () => {
		const wrapper = shallow( <CustomTreeSelector nodes={ [ node1 ] } /> );
		expect( wrapper.find( '.custom-tree-selector__placeholder' ) ).to.have.length( 0 );
	} );

	test( 'should render a single node', () => {
		const wrapper = shallow( <CustomTreeSelector nodes={ [ node1 ] } /> );
		expect( wrapper.find( '.custom-tree-selector' ) ).to.have.length( 1 );
		expect( wrapper.find( CustomTreeNode ) ).to.have.length( 1 );
	} );

	test( 'should render more than one node', () => {
		const wrapper = shallow( <CustomTreeSelector nodes={ [ node1, node3 ] } /> );
		expect( wrapper.find( CustomTreeNode ) ).to.have.length( 2 );
	} );

	test( 'should pass through onNodeSelect callback', () => {
		const onNodeSelect = () => {};
		const wrapper = shallow( <CustomTreeSelector nodes={ [ node1 ] } onNodeSelect={ onNodeSelect } /> );
		expect( wrapper.find( CustomTreeNode ).props().onNodeSelect ).to.equal( onNodeSelect );
	} );
} );
