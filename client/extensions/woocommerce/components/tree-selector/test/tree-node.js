/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { spy } from 'sinon';
import React from 'react';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormInputCheckbox from 'components/forms/form-checkbox';
import TreeNode from '../tree-node';
import { node1, node2 } from './fixtures/nodes';

describe( 'TreeNode', () => {
	test( 'should render a `.tree-selector__node`', () => {
		const wrapper = shallow( <TreeNode node={ node1 } /> );
		expect( wrapper.find( '.tree-selector__node' ) ).to.have.length( 1 );
	} );

	test( 'should render a label span', () => {
		const wrapper = shallow( <TreeNode node={ node1 } /> );

		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		expect( wrapper.contains( <span className="tree-selector__label">{ 'Node One' }</span> ) ).to.be.true;
	} );

	test( 'should render a FormLabel', () => {
		const wrapper = shallow( <TreeNode node={ node1 } /> );
		expect( wrapper.find( FormLabel ) ).to.have.length( 1 );
	} );

	test( 'should render a checkbox', () => {
		const wrapper = shallow( <TreeNode node={ node1 } /> );
		const checkbox = wrapper.find( FormInputCheckbox );
		expect( checkbox ).to.have.length( 1 );

		const props = checkbox.props();
		expect( props.checked ).to.not.be.true;
	} );

	test( 'should render a checked checkbox', () => {
		const node = { ...node1, selected: true };
		const wrapper = shallow( <TreeNode node={ node } /> );
		const checkbox = wrapper.find( FormInputCheckbox );
		expect( checkbox ).to.have.length( 1 );

		const props = checkbox.props();
		expect( props.checked ).to.be.true;
	} );

	test( 'should not render a checkbox if `onSelect` is null', () => {
		const onNodeSelect = () => {};
		const node = { ...node1, onSelect: null };
		const wrapper = shallow( <TreeNode node={ node } onNodeSelect={ onNodeSelect } /> );

		expect( wrapper.find( FormInputCheckbox ) ).to.have.length( 0 );
	} );

	test( 'should render without children', () => {
		const wrapper = shallow( <TreeNode node={ node1 } /> );
		expect( wrapper.find( TreeNode ) ).to.have.length( 0 );
	} );

	test( 'should render children', () => {
		const wrapper = shallow( <TreeNode node={ node2 } /> );
		expect( wrapper.find( TreeNode ) ).to.have.length( 3 );
	} );

	test( 'should call onNodeSelect', () => {
		const onNodeSelect = spy();
		const wrapper = shallow( <TreeNode node={ node1 } onNodeSelect={ onNodeSelect } /> );
		const checkbox = wrapper.find( FormInputCheckbox );

		checkbox.props().onChange( { target: { checked: true } } );

		expect( onNodeSelect ).to.have.been.calledOnce;
	} );

	test( 'should call custom onSelect when provided', () => {
		const onNodeSelect = spy();
		const onSelect = spy();
		const node = { ...node1, onSelect };
		const wrapper = shallow( <TreeNode node={ node } onNodeSelect={ onNodeSelect } /> );
		const checkbox = wrapper.find( FormInputCheckbox );

		checkbox.props().onChange( { target: { checked: true } } );

		expect( onSelect ).to.have.been.calledOnce;
		expect( onNodeSelect ).to.not.have.been.called;
	} );
} );

