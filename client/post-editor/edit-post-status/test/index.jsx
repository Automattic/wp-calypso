/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import { EditPostStatus } from '../';

jest.mock( 'lib/user', () => () => {} );

describe( 'EditPostStatus', function() {
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
