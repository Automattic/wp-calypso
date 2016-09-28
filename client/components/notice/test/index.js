/**
 * External dependencies
 */
import { assert } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { UnwrappedNotice } from '../index';

describe( 'index', function() {
	require( 'test/helpers/use-fake-dom' )();
	it( 'should output the component', function() {
		const wrapper = shallow( <UnwrappedNotice translate={ identity } /> );
		assert.equal( true, wrapper.find( '.notice' ).length );
	} );

	it( 'should have dismiss button when showDismiss passed as true', function() {
		const wrapper = shallow( <UnwrappedNotice showDismiss={ true } translate={ identity } /> );
		assert.equal( true, wrapper.find( '.is-dismissable' ).length );
	} );

	it( 'should have compact look when isCompact passed as true', function() {
		const wrapper = shallow( <UnwrappedNotice isCompact={ true } translate={ identity } /> );
		assert.equal( true, wrapper.find( '.is-compact' ).length );
	} );

	it( 'should have proper class and icon for is-info status parameter', function() {
		const wrapper = shallow( <UnwrappedNotice status="is-info" translate={ identity } /> );
		assert.equal( true, wrapper.find( '.is-info' ).length );

		console.log( wrapper.children().nodes );
		
		/*expect( wrapper.children().contains( [
			<svg />,
		] ) ).to.equal( true ); */
		//	<svg className="gridicon gridicons-info notice__icon" height="24" width="24" />,


		//assert.equal( true, wrapper.find( 'svg' ).length );
		//assert.equal( true, wrapper.children().find( '.gridicons-info' ).length );
		//console.log( wrapper.children() );

/*		const wrapper = shallow( <UnwrappedNotice status="is-success" translate={ identity } /> );
		assert.equal( true, wrapper.find( '.is-success' ).length );

		const wrapper = shallow( <UnwrappedNotice status="is-error" translate={ identity } /> );
		assert.equal( true, wrapper.find( '.is-error' ).length );

		const wrapper = shallow( <UnwrappedNotice status="is-warning" translate={ identity } /> );
		assert.equal( true, wrapper.find( '.is-warning' ).length ); */
	} );

} );
