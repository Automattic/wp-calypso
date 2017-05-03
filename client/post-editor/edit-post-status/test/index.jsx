/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { noop } from 'lodash';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'EditPostStatus', function() {
	let EditPostStatus;

	useFakeDom();

	before( function() {
		EditPostStatus = require( '../' ).EditPostStatus;
	} );

	it( 'should hide sticky option for password protected posts', function() {
		const wrapper = shallow(
			<EditPostStatus post={ { password: 'password' } } type={ 'post' } />
		);

		expect( wrapper.find( '.edit-post-status__sticky' ) ).to.have.lengthOf( 0 );
	} );

	it( 'should hide sticky option for private posts', function() {
		const wrapper = shallow(
			<EditPostStatus post={ { status: 'private' } } type={ 'post' } />
		);

		expect( wrapper.find( '.edit-post-status__sticky' ) ).to.have.lengthOf( 0 );
	} );

	it( 'should show sticky option for published posts', function() {
		const wrapper = shallow(
			<EditPostStatus post={ { status: 'publish' } } type={ 'post' } translate={ noop } />
		);

		expect( wrapper.find( '.edit-post-status__sticky' ) ).to.have.lengthOf( 1 );
	} );
} );
