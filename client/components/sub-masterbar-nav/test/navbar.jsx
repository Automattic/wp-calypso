/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import Navbar from '../navbar';
import Item from '../item';

describe( 'Navbar', () => {
	const options = [
		{ label: 'sites', uri: '/sites', icon: 'star' },
		{ label: 'more', uri: '/more', icon: 'star' }
	];

	const renderItems = () => {
		return options.map( ( item, index ) => (
			<Item
				key={ index }
				label={ item.label }
				icon={ item.icon }
				href={ item.uri }
			/>
		) );
	};

	it( 'should render a navbar containing the children', () => {
		const wrapper = shallow(
			<Navbar>
				{ renderItems() }
			</Navbar>
		);

		const items = wrapper.find( Item );

		expect( items.length ).to.equal( 2 );
		expect( items.at( 0 ).prop( 'label' ) ).to.equal( 'sites' );
		expect( items.at( 1 ).prop( 'label' ) ).to.equal( 'more' );
		expect( items.at( 0 ).prop( 'icon' ) ).to.equal( 'star' );
		expect( items.at( 1 ).prop( 'icon' ) ).to.equal( 'star' );
	} );
} );
