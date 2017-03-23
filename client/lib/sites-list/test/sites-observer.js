/**
 * External dependencies
 */
import React from 'react';
import { assert, expect } from 'chai';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import sitesObserver from '../sites-observer';

class MockInnerComponent extends React.Component {
	render() {
		return ( <div>Fake Component</div> );
	}
}

describe( 'SitesObserver', () => {
	let wrapper, SitesObserverHOC, mockSites;

	function mockEventEmitter( name ) {
		const onCalls = [];
		const offCalls = [];

		return {
			onCalls,
			offCalls,
			mock: {
				on: function( event/*, callback*/ ) {
					onCalls.push( name );
					assert.deepEqual( 'change', event );
				},
				off: function( event/*, callback*/ ) {
					offCalls.push( name );
					assert.deepEqual( 'change', event );
				}
			}
		};
	}

	beforeEach( () => {
		SitesObserverHOC = sitesObserver( MockInnerComponent );
		mockSites = mockEventEmitter( 'testSites' );

		wrapper = shallow( <SitesObserverHOC
			sites={ mockSites.mock }
			someProp={ 42 } />,
		{ lifecycleExperimental: true } );
	} );

	it( 'wrapped component is rendered', () => {
		expect( wrapper.first().type() ).to.equal( MockInnerComponent );
	} );

	it( 'change event should create new instance in sites prop', () => {
		// Store the current (last) sites prop the wrapped component has.
		const lastSites = wrapper.find( MockInnerComponent ).props().sites;

		// First call SitesObserverHOC.cacheSites() method to simulate `change` event.
		wrapper.instance().cacheSites();

		// Then call Enzyme update to re-render the component.
		wrapper.update();

		// Ensure the sites prop of the wrapped component is different object than
		// the last sites instance so shallow compare will detect change.
		expect( wrapper.find( MockInnerComponent ).props().sites ).to.not.equal( lastSites );
	} );

	it( 'component register to sites.on(change)', () => {
		assert.deepEqual( [ 'testSites' ], mockSites.onCalls );
	} );

	it( 'after unmount sites.off(change) should be called', () => {
		wrapper.unmount();
		assert.deepEqual( [ 'testSites' ], mockSites.offCalls );
	} );

	it( 'other properties pass-through', () => {
		expect( wrapper.find( MockInnerComponent ).props().someProp ).to.equal( 42 );
	} );
} );
