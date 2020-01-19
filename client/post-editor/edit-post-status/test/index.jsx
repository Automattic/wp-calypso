/**
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

describe( 'EditPostStatus', () => {
	test( 'should hide sticky option for password protected posts', () => {
		const wrapper = shallow(
			<EditPostStatus post={ { type: 'post', status: 'draft', password: 'password' } } />
		);

		expect( wrapper.find( '.edit-post-status__sticky' ) ).to.have.lengthOf( 0 );
	} );

	test( 'should hide sticky option for private posts', () => {
		const wrapper = shallow(
			<EditPostStatus post={ { type: 'post', status: 'private', password: '' } } />
		);

		expect( wrapper.find( '.edit-post-status__sticky' ) ).to.have.lengthOf( 0 );
	} );

	test( 'should show sticky option for published posts', () => {
		const wrapper = shallow(
			<EditPostStatus
				post={ { type: 'post', status: 'published', password: '' } }
				translate={ noop }
			/>
		);

		expect( wrapper.find( '.edit-post-status__sticky' ) ).to.have.lengthOf( 1 );
	} );
} );
