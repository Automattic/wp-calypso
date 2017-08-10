/** @format */
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
import useMockery from 'test/helpers/use-mockery';

describe( 'EditPostStatus', function() {
	let EditPostStatus;

	useFakeDom();
	useMockery();

	useMockery( mockery => {
		mockery.registerMock( 'lib/wp', {
			me: () => ( {
				get: noop,
			} ),
		} );
	} );

	before( function() {
		EditPostStatus = require( '../' ).EditPostStatus;
	} );

	it( 'should hide sticky option for password protected posts', function() {
		const wrapper = shallow(
			<EditPostStatus post={ { password: 'password' } } isPostPrivate={ false } type={ 'post' } />
		);

		expect( wrapper.find( '.edit-post-status__sticky' ) ).to.have.lengthOf( 0 );
	} );

	it( 'should hide sticky option for private posts', function() {
		const wrapper = shallow(
			<EditPostStatus post={ { password: '' } } isPostPrivate={ true } type={ 'post' } />
		);

		expect( wrapper.find( '.edit-post-status__sticky' ) ).to.have.lengthOf( 0 );
	} );

	it( 'should show sticky option for published posts', function() {
		const wrapper = shallow(
			<EditPostStatus
				post={ { password: '' } }
				type={ 'post' }
				isPostPrivate={ false }
				translate={ noop }
			/>
		);

		expect( wrapper.find( '.edit-post-status__sticky' ) ).to.have.lengthOf( 1 );
	} );
} );
