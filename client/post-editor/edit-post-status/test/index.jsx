/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { noop } from 'lodash';
import { shallow } from 'enzyme';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'EditPostStatus', function() {
	let EditPostStatus, PostEditStore, sandbox;

	useFakeDom();

	before( function() {
		EditPostStatus = require( '../' ).EditPostStatus;
		PostEditStore = require( 'lib/posts/post-edit-store' );
		sandbox = sinon.sandbox.create();
	} );

	afterEach( function() {
		sandbox.restore();
	} );

	it( 'should hide sticky option for password protected posts', function() {
		sandbox.stub( PostEditStore, 'get' ).returns( {
			status: 'publish'
		} );

		const wrapper = shallow(
			<EditPostStatus post={ { password: 'password' } } type={ 'post' } />
		);

		expect( wrapper.find( '.edit-post-status__sticky' ) ).to.have.lengthOf( 0 );
	} );

	it( 'should hide sticky option for private posts', function() {
		sandbox.stub( PostEditStore, 'get' ).returns( {
			status: 'private'
		} );

		const wrapper = shallow(
			<EditPostStatus post={ { password: '' } } type={ 'post' } />
		);

		expect( wrapper.find( '.edit-post-status__sticky' ) ).to.have.lengthOf( 0 );
	} );

	it( 'should show sticky option for published posts', function() {
		sandbox.stub( PostEditStore, 'get' ).returns( {
			status: 'publish'
		} );

		const wrapper = shallow(
			<EditPostStatus post={ { password: '' } } type={ 'post' } translate={ noop } />
		);

		expect( wrapper.find( '.edit-post-status__sticky' ) ).to.have.lengthOf( 1 );
	} );
} );
